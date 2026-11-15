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

import AlsoRunning from '@/components/infra/AlsoRunning.astro'
import { SITES } from '@/data/sites'
import { SERVICE_COUNT, UNNAMED_BY_MACHINE } from '@/lib/inventory'
import { render } from '@/test/astro'

async function list() {
  return render(AlsoRunning)
}

describe('AlsoRunning', () => {
  it('gives each machine a row', async () => {
    const body = await list()

    expect(
      within(body)
        .getAllByRole('term')
        .map((term) => term.textContent),
    ).toEqual(UNNAMED_BY_MACHINE.map((entry) => entry.machine))
    expect(within(body).getByText('gem server')).toBeInTheDocument()
    expect(within(body).getByText('gems desktop')).toBeInTheDocument()
  })

  it('names what a machine runs that no hostname covers', async () => {
    const gem = within(await list()).getByText('gem server').parentElement

    expect(gem).toHaveTextContent('cloudflared')
    expect(gem).toHaveTextContent('nginx')
    expect(gem).toHaveTextContent('nftables')
  })

  it('prints every name of every machine, separated by a dot', async () => {
    const body = await list()

    for (const entry of UNNAMED_BY_MACHINE) {
      const row = within(body).getByText(entry.machine).parentElement!
      const definition = within(row).getByRole('definition')

      expect(definition.textContent?.replace(/\s+/g, ' ').trim()).toBe(entry.names.join(' · '))
    }
  })

  it('names a program once per machine, however many containers run it', () => {
    for (const entry of UNNAMED_BY_MACHINE) {
      expect(new Set(entry.names).size, entry.machine).toBe(entry.names.length)
    }
  })

  it('leaves out anything a hostname already names', async () => {
    const body = await list()

    for (const name of ['jellyfin', 'grafana', 'prometheus', 'wg-easy']) {
      expect(within(body).queryByText(new RegExp(name)), name).not.toBeInTheDocument()
    }
  })

  it('lists the processes that share a box, so none goes uncounted', async () => {
    const gem = within(await list()).getByText('gem server').parentElement

    expect(gem).toHaveTextContent('cron')
    expect(gem).toHaveTextContent('ntpd')
    expect(gem).toHaveTextContent('renovate')
  })

  it('counts the private service without naming it', async () => {
    const body = await list()

    expect(within(body).queryByText(/private service/)).not.toBeInTheDocument()
    expect(SERVICE_COUNT).toBe(63)
  })

  it('names nothing twice across the two machines', () => {
    const counted = UNNAMED_BY_MACHINE.flatMap((entry) => entry.names)
    const named = new Set(SITES.map((site) => site.service))

    expect(counted.length).toBeGreaterThan(20)
    expect(named.size).toBeGreaterThan(20)
  })
})
