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

// @vitest-environment node
import { within } from '@testing-library/dom'

import Infrastructure from '@/components/sections/Infrastructure.astro'
import { PUBLIC_WEB_COUNT } from '@/data/sites'
import { TOPOLOGY_EDGES } from '@/data/topology'
import { SERVICE_COUNT } from '@/lib/inventory'
import { render } from '@/test/astro'

async function section() {
  return render(Infrastructure)
}

describe('Infrastructure', () => {
  it('renders the section header and an intro with the service count', async () => {
    const body = await section()

    expect(
      within(body).getByRole('heading', { name: 'Infrastructure', level: 2 }),
    ).toBeInTheDocument()
    expect(within(body).getByText(/Two machines behind one router/)).toHaveTextContent(
      `running ${SERVICE_COUNT} services`,
    )
  })

  it('states the figures that matter, from the data rather than by hand', async () => {
    const body = await section()
    const figure = (label: string) =>
      within(body).getByText(label).previousElementSibling?.textContent?.trim()

    expect(figure('services running')).toBe(String(SERVICE_COUNT))
    expect(figure('websites served')).toBe(String(PUBLIC_WEB_COUNT))
    expect(figure('links between services')).toBe(String(TOPOLOGY_EDGES.length))
  })

  it('leaves the firewall and address-family detail off the page', async () => {
    const body = await section()

    expect(within(body).queryByText(/ports open to the internet/)).not.toBeInTheDocument()
    expect(within(body).queryByText(/firewall/i)).not.toBeInTheDocument()
    expect(within(body).queryByText(/IPv6/)).not.toBeInTheDocument()
    expect(within(body).queryByText(/carrier's NAT/)).not.toBeInTheDocument()
  })

  it('carries the host lists and the rest of what runs', async () => {
    const body = await section()

    for (const id of ['hosts-public', 'hosts-onion', 'hosts-i2p', 'hosts-lan', 'hosts-ci']) {
      expect(within(body).getByTestId(id)).toBeInTheDocument()
    }
    expect(within(body).getByTestId('also-running')).toBeInTheDocument()
  })

  it('leads with the public services, which is the part worth seeing first', async () => {
    const order = within(await section())
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent)

    expect(order).toEqual([
      'Public services',
      'Hidden services',
      'I2P sites',
      'Private services',
      'CI runners',
      'Also running',
    ])
  })

  it('puts each host list under its own heading', async () => {
    const body = await section()
    const lists = [
      ['Public services', 'hosts-public'],
      ['Hidden services', 'hosts-onion'],
      ['I2P sites', 'hosts-i2p'],
      ['Private services', 'hosts-lan'],
      ['CI runners', 'hosts-ci'],
      ['Also running', 'also-running'],
    ]

    for (const [title, id] of lists) {
      const heading = within(body).getByRole('heading', { name: title, level: 3 })

      expect(heading.parentElement, title).toContainElement(within(body).getByTestId(id))
    }
  })
})
