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

import { Mail } from 'lucide-react'
import { SiGithub } from 'react-icons/si'

import { svg } from './svg'

function parse(markup: string): Element {
  const host = document.createElement('div')
  host.innerHTML = markup
  return host.firstElementChild!
}

describe('svg', () => {
  it('draws a lucide icon as one svg element with its class', () => {
    const icon = parse(svg(Mail, { className: 'h-4 w-4' }))

    expect(icon.tagName).toBe('svg')
    expect(icon).toHaveClass('h-4', 'w-4')
    expect(icon.querySelector('path')).not.toBeNull()
  })

  it('draws a react-icons icon and passes aria-hidden through', () => {
    const icon = parse(svg(SiGithub, { 'aria-hidden': 'true' }))

    expect(icon.tagName).toBe('svg')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('leaves no React markers in the markup', () => {
    expect(svg(Mail)).not.toMatch(/<!--|data-reactroot/)
  })
})
