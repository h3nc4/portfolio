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
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useAfterLoad } from '@/hooks/useAfterLoad'

import { DeviceFrame } from './DeviceFrame'

vi.mock('@/hooks/useAfterLoad', () => ({ useAfterLoad: vi.fn(() => true) }))

describe('DeviceFrame', () => {
  afterEach(() => {
    vi.mocked(useAfterLoad).mockReturnValue(true)
  })

  it('leaves the iframe empty until the page has loaded', () => {
    vi.mocked(useAfterLoad).mockReturnValue(false)
    render(<DeviceFrame src="https://example.com" title="Test" />)
    expect(screen.getByTitle('Test')).not.toHaveAttribute('src')
  })

  it('renders iframe with correct src and title', () => {
    const src = 'https://example.com'
    const title = 'Example App'
    render(<DeviceFrame src={src} title={title} />)

    const iframe = screen.getByTitle(title)
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', src)
  })

  it('renders the live badge with a pulsing dot', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    expect(screen.getByText('Live Interactive Preview')).toBeInTheDocument()
    expect(screen.getByTestId('live-pulse')).toHaveClass('animate-ping')
  })

  it('renders with correct default attributes', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    const iframe = screen.getByTitle('Test')

    expect(iframe).toHaveAttribute('loading', 'eager')
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

  // The stylesheet turns the custom property into the iframe's size and scale
  it('publishes the default zoom as a custom property', () => {
    render(<DeviceFrame src="https://example.com" title="Test" />)
    expect(screen.getByTitle('Test').style.getPropertyValue('--device-zoom')).toBe('0.7')
  })

  it('publishes an explicit zoom as a custom property', () => {
    render(<DeviceFrame src="https://example.com" title="Test" zoom={0.5} />)
    expect(screen.getByTitle('Test').style.getPropertyValue('--device-zoom')).toBe('0.5')
  })
})
