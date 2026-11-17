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

import HyperGesturePreview from '@/components/HyperGesturePreview.astro'
import { render } from '@/test/astro'

const SCREEN_NAMES = ['Home', 'Gestures', 'Setup']

async function preview() {
  return render(HyperGesturePreview)
}

describe('HyperGesturePreview', () => {
  it('describes every screenshot and gives each its intrinsic size', async () => {
    const images = within(await preview()).getAllByRole('img', { hidden: true })

    expect(images).toHaveLength(SCREEN_NAMES.length)
    images.forEach((image) => {
      expect(image).toHaveAttribute('alt', expect.stringMatching(/\w{4,}/))
      expect(image).toHaveAttribute('width', '360')
      expect(image).toHaveAttribute('height', '757')
      expect(image).toHaveAttribute('srcset', expect.stringMatching(/ 360w, .+ 540w, .+ 720w$/))
    })
  })

  it('shows the home screen first, loads it eagerly and defers the rest', async () => {
    const body = await preview()
    const shown = within(body).getAllByRole('img')

    expect(shown).toHaveLength(1)
    expect(shown[0]).toHaveAccessibleName(/home screen/i)
    expect(shown[0]).toHaveAttribute('loading', 'eager')
    within(body)
      .getAllByRole('img', { hidden: true })
      .slice(1)
      .forEach((image) => {
        expect(image).toHaveAttribute('aria-hidden', 'true')
        expect(image).toHaveAttribute('loading', 'lazy')
      })
  })

  it('presses the home button and no other', async () => {
    const body = await preview()

    expect(within(body).getByRole('button', { name: 'Home' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(within(body).getByRole('button', { name: 'Gestures' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(within(body).getByRole('button', { name: 'Setup' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('groups the buttons under one name', async () => {
    const body = await preview()
    const group = within(body).getByRole('group', { name: 'HyperGesture app screens' })

    expect(
      within(group)
        .getAllByRole('button')
        .map((button) => button.textContent?.trim()),
    ).toEqual(SCREEN_NAMES)
  })

  it('puts the switcher in the pill above the handset', async () => {
    const body = await preview()

    expect(within(body).getByTestId('phone-badge')).toContainElement(
      within(body).getByRole('group', { name: 'HyperGesture app screens' }),
    )
  })

  it('covers the screen with a button that advances it', async () => {
    const body = await preview()

    expect(within(body).getByRole('button', { name: 'Next app screen' })).toHaveAttribute(
      'data-screen-next',
    )
    expect(within(body).getByTestId('device-frame-container')).toHaveAttribute('data-screens')
  })
})
