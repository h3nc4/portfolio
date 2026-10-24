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

import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { HyperGesturePreview } from './HyperGesturePreview'

const SCREEN_NAMES = ['Home', 'Gestures', 'Setup']

function shownImages() {
  return screen.getAllByRole('img')
}

describe('HyperGesturePreview', () => {
  it('describes every screenshot and gives each its intrinsic size', () => {
    render(<HyperGesturePreview />)
    const images = screen.getAllByRole('img', { hidden: true })

    expect(images).toHaveLength(SCREEN_NAMES.length)
    images.forEach((image) => {
      expect(image).toHaveAttribute('alt', expect.stringMatching(/\w{4,}/))
      expect(image).toHaveAttribute('width', '360')
      expect(image).toHaveAttribute('height', '757')
      expect(image).toHaveAttribute('srcset', expect.stringMatching(/ 360w, .+ 720w$/))
    })
  })

  it('shows the home screen first, loads it eagerly and defers the rest', () => {
    render(<HyperGesturePreview />)

    expect(shownImages()).toHaveLength(1)
    expect(shownImages()[0]).toHaveAccessibleName(/home screen/i)
    expect(shownImages()[0]).toHaveAttribute('loading', 'eager')
    screen
      .getAllByRole('img', { hidden: true })
      .slice(1)
      .forEach((image) => expect(image).toHaveAttribute('loading', 'lazy'))
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('switches screen on click', async () => {
    const user = userEvent.setup()
    render(<HyperGesturePreview />)

    await user.click(screen.getByRole('button', { name: 'Gestures' }))

    expect(shownImages()).toHaveLength(1)
    expect(shownImages()[0]).toHaveAccessibleName(/gesture settings/i)
    expect(screen.getByRole('button', { name: 'Gestures' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('switches screen from the keyboard', async () => {
    const user = userEvent.setup()
    render(<HyperGesturePreview />)

    await user.tab()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Setup' })).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(shownImages()[0]).toHaveAccessibleName(/setup checklist/i)

    await user.tab({ shift: true })
    await user.keyboard(' ')
    expect(shownImages()[0]).toHaveAccessibleName(/gesture settings/i)
  })

  it('groups the buttons under one name', () => {
    render(<HyperGesturePreview />)
    const group = screen.getByRole('group', { name: 'HyperGesture app screens' })

    expect(group.querySelectorAll('button')).toHaveLength(SCREEN_NAMES.length)
    SCREEN_NAMES.forEach((name) => {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    })
  })

  it('puts the switcher in the pill above the handset', () => {
    render(<HyperGesturePreview />)
    expect(screen.getByTestId('phone-badge')).toContainElement(
      screen.getByRole('group', { name: 'HyperGesture app screens' }),
    )
  })

  it('advances on a tap of the screen and wraps after the last', async () => {
    const user = userEvent.setup()
    render(<HyperGesturePreview />)
    const phone = screen.getByRole('button', { name: 'Next app screen' })

    await user.click(phone)
    expect(shownImages()[0]).toHaveAccessibleName(/gesture settings/i)
    await user.click(phone)
    await user.click(phone)
    expect(shownImages()[0]).toHaveAccessibleName(/home screen/i)
  })

  it('advances from the keyboard on the screen', async () => {
    const user = userEvent.setup()
    render(<HyperGesturePreview />)

    screen.getByRole('button', { name: 'Next app screen' }).focus()
    await user.keyboard('{Enter}')
    expect(shownImages()[0]).toHaveAccessibleName(/gesture settings/i)
  })

  it('goes back on a swipe right, wrapping to the last screen', () => {
    render(<HyperGesturePreview />)
    const phone = screen.getByRole('button', { name: 'Next app screen' })

    fireEvent.pointerDown(phone, { clientX: 50, clientY: 100 })
    fireEvent.pointerUp(phone, { clientX: 150, clientY: 110 })
    fireEvent.click(phone, { detail: 1 })

    expect(shownImages()[0]).toHaveAccessibleName(/setup checklist/i)
  })
})
