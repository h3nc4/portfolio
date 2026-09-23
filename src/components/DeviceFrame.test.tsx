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

  // The zoom is published as a custom property and the stylesheet turns it into
  // width, height and scale, so a media query can lower it on small viewports.
  const zoomCases: {
    label: string
    props: Partial<{
      zoom: number
      mobileZoom: number
      largeZoom: number
      smallPhoneZoom: number
    }>
    property: string
    value: string
  }[] = [
    { label: 'the desktop default', props: {}, property: '--device-zoom', value: '0.8' },
    { label: 'the mobile default', props: {}, property: '--device-zoom-sm', value: '0.72' },
    { label: 'the large default', props: {}, property: '--device-zoom-lg', value: '0.8' },
    { label: 'an explicit zoom', props: { zoom: 0.5 }, property: '--device-zoom', value: '0.5' },
    {
      label: 'an explicit mobile zoom',
      props: { mobileZoom: 0.4 },
      property: '--device-zoom-sm',
      value: '0.4',
    },
    { label: 'the small-phone default', props: {}, property: '--device-zoom-xs', value: '0.62' },
    {
      label: 'an explicit small-phone zoom',
      props: { smallPhoneZoom: 0.55 },
      property: '--device-zoom-xs',
      value: '0.55',
    },
    {
      label: 'an explicit large zoom',
      props: { largeZoom: 0.95 },
      property: '--device-zoom-lg',
      value: '0.95',
    },
  ]

  it.each(zoomCases)('publishes $label as a custom property', ({ props, property, value }) => {
    render(<DeviceFrame src="https://example.com" title="Test" {...props} />)

    expect(screen.getByTitle('Test').style.getPropertyValue(property)).toBe(value)
  })
})
