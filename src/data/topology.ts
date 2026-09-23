/*
 * Copyright (C) 2026  Henrique Almeida
 * This file is part of Portfolio.
 *
 * Portfolio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Portfolio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.
 */

import rawTopology from './topology.json'

/** How much of the machine a box stands for, which decides how it is drawn. */
export type NodeKind = 'zone' | 'machine' | 'runtime' | 'group' | 'device' | 'service'

/** How far a link is exposed, which decides the colour it is drawn in. */
export type EdgeKind = 'tls' | 'wire' | 'host'

export interface TopologyNode {
  id: string
  kind: NodeKind
  label: string
  /** An address or CIDR this box answers on. */
  addr?: string
  /** A qualifier too short to deserve its own box. */
  note?: string
  /** Listening ports, as strings so a range such as 40000-40040 fits. */
  ports?: string[]
  /** Processes that share this box instead of taking one each. */
  items?: string[]
  /** True to count this service without naming it, as a private one. */
  hidden?: boolean
  /** Which column holds this root, numbered left to right along the traffic. */
  col?: number
  children?: TopologyNode[]
}

export interface TopologyEdge {
  from: string
  to: string
  label: string
  kind: EdgeKind
}

interface RawTopology {
  nodes: TopologyNode[]
  edges: TopologyEdge[]
}

const data = rawTopology as RawTopology

/** The roots of the tree, one per zone or standalone device. */
export const TOPOLOGY_NODES: TopologyNode[] = data.nodes

/** Every link, from any depth to any other. */
export const TOPOLOGY_EDGES: TopologyEdge[] = data.edges

/** Walks the tree depth first, parents before children. */
export function walkTopology(
  nodes: TopologyNode[],
  visit: (node: TopologyNode, depth: number) => void,
  depth = 0,
): void {
  for (const node of nodes) {
    visit(node, depth)
    walkTopology(node.children ?? [], visit, depth + 1)
  }
}

/** Every node by id, so an edge endpoint at any depth can be looked up in constant time. */
export const TOPOLOGY_INDEX: ReadonlyMap<string, TopologyNode> = (() => {
  const index = new Map<string, TopologyNode>()
  walkTopology(TOPOLOGY_NODES, (node) => index.set(node.id, node))

  return index
})()

/** The ids of every strict ancestor of a node, outermost first. */
export function ancestorIds(id: string): string[] {
  const parts = id.split('.')

  return parts.slice(0, -1).map((_, i) => parts.slice(0, i + 1).join('.'))
}

/** Every service. A service is a node with no children of its own. */
export const SERVICES: TopologyNode[] = [...TOPOLOGY_INDEX.values()].filter(
  (node) => (node.children?.length ?? 0) === 0,
)

/** The machines the section is organised by. */
export const MACHINES: TopologyNode[] = [...TOPOLOGY_INDEX.values()].filter(
  (node) => node.kind === 'machine',
)
