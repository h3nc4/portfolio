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
import { describe, expect, it } from 'vitest'

import { SITES } from '@/data/sites'
import { SERVICE_COUNT, UNNAMED_BY_MACHINE } from '@/lib/inventory'

import { AlsoRunning } from './AlsoRunning'

describe('AlsoRunning', () => {
  it('gives each machine a row', () => {
    render(<AlsoRunning />)

    expect(screen.getByText('gem server')).toBeInTheDocument()
    expect(screen.getByText('gems desktop')).toBeInTheDocument()
  })

  it('names what a machine runs that no hostname covers', () => {
    render(<AlsoRunning />)

    const gem = screen.getByText('gem server').parentElement

    expect(gem).toHaveTextContent('cloudflared')
    expect(gem).toHaveTextContent('lan-proxy')
    expect(gem).toHaveTextContent('nftables')
  })

  it('leaves out anything a hostname already names', () => {
    render(<AlsoRunning />)

    for (const name of ['jellyfin', 'grafana', 'prometheus', 'wg-easy']) {
      expect(screen.queryByText(new RegExp(name)), name).not.toBeInTheDocument()
    }
  })

  it('lists the processes that share a box, so none goes uncounted', () => {
    render(<AlsoRunning />)

    const gem = screen.getByText('gem server').parentElement

    expect(gem).toHaveTextContent('cron')
    expect(gem).toHaveTextContent('ntpd')
    expect(gem).toHaveTextContent('renovate')
  })

  it('counts the private service without naming it', () => {
    render(<AlsoRunning />)

    expect(screen.queryByText(/private service/)).not.toBeInTheDocument()
    expect(SERVICE_COUNT).toBe(60)
  })

  it('names nothing twice across the two machines', () => {
    const counted = UNNAMED_BY_MACHINE.flatMap((entry) => entry.names)
    const named = new Set(SITES.map((site) => site.service))

    expect(counted.length).toBeGreaterThan(20)
    expect(named.size).toBeGreaterThan(20)
  })
})
