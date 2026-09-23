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

import { describe, expect, it } from 'vitest'

import {
  ancestorIds,
  MACHINES,
  SERVICES,
  TOPOLOGY_EDGES,
  TOPOLOGY_INDEX,
  TOPOLOGY_NODES,
  type TopologyNode,
  walkTopology,
} from './topology'

describe('ancestorIds', () => {
  it('gives a root no ancestors', () => {
    expect(ancestorIds('router')).toEqual([])
  })

  it('lists every containing box, outermost first', () => {
    expect(ancestorIds('lan.gem.docker.quiet.cfd')).toEqual([
      'lan',
      'lan.gem',
      'lan.gem.docker',
      'lan.gem.docker.quiet',
    ])
  })
})

describe('walkTopology', () => {
  const tree: TopologyNode[] = [
    {
      id: 'a',
      kind: 'zone',
      label: 'a',
      children: [{ id: 'a.b', kind: 'service', label: 'a.b' }],
    },
    { id: 'c', kind: 'device', label: 'c' },
  ]

  it('visits a parent before its children and tracks depth', () => {
    const seen: [string, number][] = []
    walkTopology(tree, (node, depth) => seen.push([node.id, depth]))

    expect(seen).toEqual([
      ['a', 0],
      ['a.b', 1],
      ['c', 0],
    ])
  })
})

describe('the topology data', () => {
  it('indexes every box in the tree', () => {
    let counted = 0
    walkTopology(TOPOLOGY_NODES, () => counted++)

    expect(TOPOLOGY_INDEX.size).toBe(counted)
  })

  it('names every box with the path of the one containing it', () => {
    walkTopology(TOPOLOGY_NODES, (node) => {
      for (const parent of ancestorIds(node.id)) {
        expect(TOPOLOGY_INDEX.has(parent)).toBe(true)
      }
    })
  })

  it('links only boxes that exist', () => {
    for (const edge of TOPOLOGY_EDGES) {
      expect(TOPOLOGY_INDEX.has(edge.from), `missing ${edge.from}`).toBe(true)
      expect(TOPOLOGY_INDEX.has(edge.to), `missing ${edge.to}`).toBe(true)
    }
  })

  it('never links a box to itself', () => {
    expect(TOPOLOGY_EDGES.filter((edge) => edge.from === edge.to)).toEqual([])
  })

  it('gives every box a label', () => {
    walkTopology(TOPOLOGY_NODES, (node) => expect(node.label).not.toBe(''))
  })

  it('puts every root in a column', () => {
    for (const root of TOPOLOGY_NODES) {
      expect(typeof root.col).toBe('number')
    }
  })
})

describe('the groupings the section uses', () => {
  it('finds the two machines', () => {
    expect(MACHINES.map((machine) => machine.id)).toEqual(['lan.gem', 'lan.gems'])
  })

  it('counts every service the estate runs', () => {
    expect(SERVICES).toHaveLength(59)
  })

  it('treats a node with children as no service of its own', () => {
    for (const service of SERVICES) {
      expect(service.children, service.id).toBeUndefined()
    }
  })
})
