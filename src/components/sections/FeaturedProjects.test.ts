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

import FeaturedProjects from '@/components/sections/FeaturedProjects.astro'
import { render } from '@/test/astro'

async function section() {
  return render(FeaturedProjects)
}

describe('FeaturedProjects', () => {
  it('puts both projects under one heading, HyperGesture first', async () => {
    const body = await section()

    expect(
      within(body).getByRole('heading', { name: 'Featured Projects', level: 2 }),
    ).toBeInTheDocument()
    expect(
      within(body)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(['HyperGesture', 'WASudoku'])
  })

  it('gives each column its own preview', async () => {
    const [hyperGesture, wasudoku] = within(await section()).getAllByRole('article')

    expect(hyperGesture).toHaveAttribute('id', 'hypergesture')
    expect(
      within(hyperGesture).getByRole('img', { name: /HyperGesture home screen/ }),
    ).toBeInTheDocument()
    expect(within(hyperGesture).queryByTitle('WASudoku Live Preview')).not.toBeInTheDocument()

    expect(wasudoku).toHaveAttribute('id', 'wasudoku')
    expect(within(wasudoku).getByTitle('WASudoku Live Preview')).toBeInTheDocument()
  })

  it('leaves the WASudoku frame empty until the page points it at its sibling', async () => {
    const [, wasudoku] = within(await section()).getAllByRole('article')
    const iframe = within(wasudoku).getByTitle('WASudoku Live Preview')

    expect(iframe).not.toHaveAttribute('src')
    expect(iframe).toHaveAttribute('data-sibling-src', 'wasudoku')
  })

  it('points Open App at the canonical WASudoku, for the page to repoint', async () => {
    const [, wasudoku] = within(await section()).getAllByRole('article')
    const openApp = within(wasudoku).getByRole('link', { name: 'Open App' })

    expect(openApp).toHaveAttribute('href', 'https://wasudoku.h3nc4.com')
    expect(openApp).toHaveAttribute('data-sibling', 'wasudoku')
  })

  it('staggers the second column after the first', async () => {
    const [first, second] = within(await section()).getAllByRole('heading', { level: 3 })

    expect(first.closest('.reveal')).not.toHaveAttribute('data-delay')
    expect(second.closest('.reveal')).toHaveAttribute('data-delay', '0.1')
  })
})
