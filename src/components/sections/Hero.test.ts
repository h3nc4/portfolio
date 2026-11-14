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

import Hero from '@/components/sections/Hero.astro'
import { render } from '@/test/astro'

async function hero() {
  return render(Hero)
}

describe('Hero', () => {
  it('renders the heading and the description', async () => {
    const body = await hero()

    expect(
      within(body).getByRole('heading', { name: 'Henrique Almeida', level: 1 }),
    ).toBeInTheDocument()
    expect(within(body).getByText(/Software and DevOps engineer/)).toBeInTheDocument()
  })

  it('links the profiles in a new tab and the mail in place', async () => {
    const body = await hero()

    const github = within(body).getByRole('link', { name: 'GitHub profile' })
    expect(github).toHaveAttribute('href', 'https://github.com/h3nc4')
    expect(github).toHaveAttribute('target', '_blank')
    expect(github).toHaveAttribute('rel', 'noopener noreferrer')

    const linkedin = within(body).getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute('href', 'https://linkedin.com/in/h3nc4')
    expect(linkedin).toHaveAttribute('target', '_blank')

    const contact = within(body).getByRole('link', { name: 'Contact Me' })
    expect(contact).toHaveAttribute('href', 'mailto:me@h3nc4.com')
    expect(contact).not.toHaveAttribute('target')
  })

  it('draws each icon as inline SVG hidden from assistive technology', async () => {
    const links = within(await hero()).getAllByRole('link')

    expect(links).toHaveLength(3)
    links.forEach((link) => {
      const icon = link.querySelector('svg')
      expect(icon).not.toBeNull()
      expect(icon).toHaveClass('h-4', 'w-4')
    })
    expect(links[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(links[1].querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  // `heroPin.ts` finds the body it shrinks by this class
  it('wraps the content in the body the pin shrinks', async () => {
    const body = await hero()

    expect(within(body).getByRole('heading', { level: 1 }).closest('.hero-body')).not.toBeNull()
  })

  // Chrome takes no paint at opacity 0 as the largest, so the hero rests at a trace instead
  it('rests painted, so its first paint counts as the largest', async () => {
    const body = await hero()

    expect(body.querySelector('.hero-body')!.closest('.reveal')).toHaveAttribute('data-painted')
  })
})
