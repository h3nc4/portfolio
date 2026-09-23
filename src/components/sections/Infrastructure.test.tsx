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

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PUBLIC_PORT_COUNT } from '@/data/exposure'
import { PUBLIC_WEB_COUNT } from '@/data/sites'
import { TOPOLOGY_EDGES } from '@/data/topology'
import { SERVICE_COUNT } from '@/lib/inventory'

import { Infrastructure } from './Infrastructure'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Infrastructure', () => {
  it('renders the section header and intro', () => {
    render(<Infrastructure />)

    expect(screen.getByRole('heading', { name: /Infrastructure/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/Two machines behind one router/i)).toBeInTheDocument()
  })

  it('states the figures that matter, from the data rather than by hand', () => {
    render(<Infrastructure />)

    expect(screen.getByText(String(SERVICE_COUNT))).toBeInTheDocument()
    expect(screen.getByText(String(PUBLIC_WEB_COUNT))).toBeInTheDocument()
    expect(screen.getByText('websites served')).toBeInTheDocument()
    expect(screen.getByText(String(PUBLIC_PORT_COUNT))).toBeInTheDocument()
    expect(screen.getByText(String(TOPOLOGY_EDGES.length))).toBeInTheDocument()
  })

  it('states that no inbound IPv4 arrives', () => {
    render(<Infrastructure />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText(/behind the carrier's NAT/)).toBeInTheDocument()
  })

  it('carries the two host lists and the rest of what runs', () => {
    render(<Infrastructure />)

    expect(screen.getByTestId('hosts-public')).toBeInTheDocument()
    expect(screen.getByTestId('hosts-lan')).toBeInTheDocument()
    expect(screen.getByTestId('hosts-ci')).toBeInTheDocument()
    expect(screen.getByTestId('also-running')).toBeInTheDocument()
  })

  it('leads with the public services, which is the part worth seeing first', () => {
    render(<Infrastructure />)

    const order = screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)

    expect(order).toEqual(['Public services', 'Private services', 'CI runners', 'Also running'])
  })
})
