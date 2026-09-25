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

import { MACHINES, TOPOLOGY_INDEX, type TopologyNode } from '@/data/topology'

import { COLOCATED_COUNT, countServices, SERVICE_COUNT } from './inventory'

const leaf: TopologyNode = { id: 'a', kind: 'service', label: 'a' }

describe('countServices', () => {
  it('counts a childless node as one', () => {
    expect(countServices(leaf)).toBe(1)
  })

  it('counts what a container holds rather than the container', () => {
    const tree: TopologyNode = {
      id: 'z',
      kind: 'group',
      label: 'z',
      children: [
        { id: 'z.a', kind: 'service', label: 'a' },
        {
          id: 'z.b',
          kind: 'group',
          label: 'b',
          children: [{ id: 'z.b.c', kind: 'service', label: 'c' }],
        },
      ],
    }

    expect(countServices(tree)).toBe(2)
  })

  it('counts what each machine runs', () => {
    const counts = MACHINES.map((machine) => countServices(machine))

    expect(counts).toEqual([30, 18])
  })
})

describe('the figures the section states', () => {
  it('counts every service in the estate', () => {
    expect(SERVICE_COUNT).toBe(60)
  })

  it('agrees with the topology it counts', () => {
    const leaves = [...TOPOLOGY_INDEX.values()].filter((node) => (node.children?.length ?? 0) === 0)

    expect(SERVICE_COUNT).toBe(leaves.length)
  })

  it('counts the processes that share a box with another', () => {
    expect(COLOCATED_COUNT).toBeGreaterThan(0)
  })
})
