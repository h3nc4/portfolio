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

import Footer from '@/components/sections/Footer.astro'
import { render } from '@/test/astro'

describe('Footer', () => {
  it('renders the copyright with the current year', async () => {
    const body = await render(Footer)
    const currentYear = new Date().getFullYear()

    expect(within(body).getByText(`© ${currentYear} Henrique Almeida.`)).toBeInTheDocument()
  })

  it('links the source of this site in a new tab', async () => {
    const footer = within(await render(Footer)).getByRole('contentinfo')
    const link = within(footer).getByRole('link', { name: /knowledge should be free/ })

    expect(link).toHaveAttribute('href', 'https://github.com/h3nc4/portfolio')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
