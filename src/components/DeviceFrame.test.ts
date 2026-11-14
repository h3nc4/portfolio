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

import DeviceFrame from '@/components/DeviceFrame.astro'
import { render } from '@/test/astro'

const PROPS = { sibling: 'wasudoku', title: 'Test' }

async function frame(props: Record<string, unknown> = {}) {
  return render(DeviceFrame, { props: { ...PROPS, ...props } })
}

describe('DeviceFrame', () => {
  it('leaves the iframe empty and names the sibling it will show', async () => {
    const iframe = within(await frame()).getByTitle('Test')

    expect(iframe).not.toHaveAttribute('src')
    expect(iframe).toHaveAttribute('data-sibling-src', 'wasudoku')
  })

  it('renders the live badge with a pulsing dot', async () => {
    const body = await frame()

    expect(within(body).getByTestId('phone-badge')).toHaveTextContent('Live Interactive Preview')
    expect(within(body).getByTestId('live-pulse')).toHaveClass('animate-ping')
  })

  it('loads eagerly, allows full screen and grants the sensors an app needs', async () => {
    const iframe = within(await frame()).getByTitle('Test')

    expect(iframe).toHaveAttribute('loading', 'eager')
    expect(iframe).toHaveAttribute('allowfullscreen')
    expect(iframe).toHaveAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    )
  })

  it('puts the iframe on the screen that sizes it', async () => {
    const iframe = within(await frame()).getByTitle('Test')

    expect(iframe.parentElement).toHaveClass('device-screen')
  })

  it('applies a custom class to the container', async () => {
    const body = await frame({ class: 'custom-class' })

    expect(within(body).getByTestId('device-frame-container')).toHaveClass('custom-class')
  })

  // The stylesheet turns the custom property into the iframe's size and scale
  it('publishes the default zoom as a custom property', async () => {
    const iframe = within(await frame()).getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom')).toBe('0.7')
  })

  it('publishes an explicit zoom as a custom property', async () => {
    const iframe = within(await frame({ zoom: 0.5 })).getByTitle('Test')

    expect(iframe.style.getPropertyValue('--device-zoom')).toBe('0.5')
  })
})
