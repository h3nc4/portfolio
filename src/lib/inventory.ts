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
 */

import { SITES } from '@/data/sites'
import { MACHINES, SERVICES, type TopologyNode, walkTopology } from '@/data/topology'

/** Services inside a subtree, counting a childless node as one. */
export function countServices(node: TopologyNode): number {
  let total = 0
  walkTopology([node], (candidate) => {
    if ((candidate.children?.length ?? 0) === 0) total += 1
  })

  return total
}

/** How many services the estate runs, which is the figure the section states. */
export const SERVICE_COUNT = SERVICES.length

/** Processes that share a box with another, which the count above leaves out. */
export const COLOCATED_COUNT = SERVICES.reduce(
  (total, service) => total + (service.items?.length ?? 0),
  0,
)

/** The service ids some hostname already names, so a list need not repeat them. */
const NAMED = new Set(SITES.map((site) => site.service))

/** One machine and the names it runs that no hostname covers. */
export interface Unnamed {
  machine: string
  names: string[]
}

/*
 * What each machine runs beyond the hostnames above. The processes sharing a
 * box are listed beside it, since a reader counting names should find them all.
 * A service marked hidden is counted and left unnamed.
 */
export const UNNAMED_BY_MACHINE: Unnamed[] = MACHINES.map((machine) => {
  const names: string[] = []

  walkTopology([machine], (node) => {
    if ((node.children?.length ?? 0) > 0 || NAMED.has(node.id) || node.hidden) return

    names.push(node.label, ...(node.items ?? []))
  })

  return { machine: machine.label, names }
})
