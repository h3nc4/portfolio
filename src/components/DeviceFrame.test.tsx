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

  // The zoom is published as a custom property and the stylesheet turns it into
  // width, height and scale, so a media query can lower it on small viewports.
  it('publishes the zoom prop as a custom property', () => {
    render(<DeviceFrame src="https://example.com" title="Test" zoom={0.5} />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom')).toBe('0.5')
  })

  it('uses default zoom of 0.8 if not provided', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom')).toBe('0.8')
  })

  it('zooms further out below 640px, defaulting to 0.72', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom-sm')).toBe('0.72')
  })

  it('accepts an explicit mobile zoom', () => {
    render(<DeviceFrame src="https://example.com" title="Test" mobileZoom={0.4} />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom-sm')).toBe('0.4')
  })

  it('matches the desktop zoom from 1024px up, defaulting to 0.8', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom-lg')).toBe('0.8')
  })

  it('accepts an explicit large zoom', () => {
    render(<DeviceFrame src="https://example.com" title="Test" largeZoom={0.95} />)
    const iframe = screen.getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom-lg')).toBe('0.95')
  })
})
