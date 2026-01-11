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

import { DeviceFrame } from './DeviceFrame'

describe('DeviceFrame', () => {
  it('renders iframe with correct src and title', () => {
    const src = 'https://example.com'
    const title = 'Example App'
    render(<DeviceFrame src={src} title={title} />)

    const iframe = screen.getByTitle(title)
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', src)
  })

  it('renders the interactive badge', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    expect(screen.getByText('Live Interactive Preview')).toBeInTheDocument()
  })

  it('renders with correct default attributes', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).toHaveAttribute('allowFullScreen')
    expect(iframe).toHaveAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    )
  })

  it('applies custom className to container', () => {
    render(<DeviceFrame src="https://example.com" title="Test" className="custom-class" />)
    const container = screen.getByTestId('device-frame-container')
    expect(container).toHaveClass('custom-class')
  })

  it('applies scaling styles based on zoom prop', () => {
    const zoom = 0.5
    render(<DeviceFrame src="https://example.com" title="Test" zoom={zoom} />)
    const iframe = screen.getByTitle('Test')

    // We check inline styles directly because 'toHaveStyle' relies on computed styles.
    // In real browsers, percentages resolve to pixels and 'scale()' resolves to 'matrix()',
    // causing tests to fail when comparing against the input strings.
    // eslint-disable-next-line jest-dom/prefer-to-have-style
    expect(iframe.style.width).toBe('200%')
    // eslint-disable-next-line jest-dom/prefer-to-have-style
    expect(iframe.style.height).toBe('200%')
    // eslint-disable-next-line jest-dom/prefer-to-have-style
    expect(iframe.style.transform).toBe('scale(0.5)')
    // Browsers may normalize '0 0' to '0px 0px', so we check loosely
    expect(iframe.style.transformOrigin).toMatch(/^0(px)? 0(px)?/)
  })

  it('uses default zoom of 0.85 if not provided', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    // eslint-disable-next-line jest-dom/prefer-to-have-style
    expect(iframe.style.transform).toBe('scale(0.85)')
  })
})
