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

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PhoneShell } from './PhoneShell'

describe('PhoneShell', () => {
  it('shows its children on the screen', () => {
    render(
      <PhoneShell badge="Test">
        <img src="shot.webp" alt="A screen" />
      </PhoneShell>,
    )
    expect(screen.getByRole('img', { name: 'A screen' })).toBeInTheDocument()
  })

  it('draws the badge content inside the pill above the handset', () => {
    render(<PhoneShell badge={<span>Screens</span>}>content</PhoneShell>)
    expect(screen.getByTestId('phone-badge')).toContainElement(screen.getByText('Screens'))
  })

  it('applies class names to the container and the screen', () => {
    render(
      <PhoneShell badge="Test" className="custom-class" screenClassName="screen-class">
        <span>inside</span>
      </PhoneShell>,
    )
    expect(screen.getByTestId('device-frame-container')).toHaveClass('custom-class')
    expect(screen.getByText('inside').parentElement).toHaveClass('screen-class')
  })
})
