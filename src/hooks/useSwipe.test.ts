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

import { renderHook } from '@testing-library/react'
import type { MouseEvent, PointerEvent } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SWIPE_HORIZONTAL_RATIO, SWIPE_MIN_DISTANCE, useSwipe } from './useSwipe'

const at = (x: number, y: number) => ({ clientX: x, clientY: y }) as PointerEvent
const pointerClick = { detail: 1 } as MouseEvent
const keyboardClick = { detail: 0 } as MouseEvent

const onTap = vi.fn()
const onSwipeLeft = vi.fn()
const onSwipeRight = vi.fn()

function setup() {
  return renderHook(() => useSwipe({ onTap, onSwipeLeft, onSwipeRight })).result.current
}

function drag(dx: number, dy: number) {
  const swipe = setup()
  swipe.onPointerDown(at(200, 200))
  swipe.onPointerUp(at(200 + dx, 200 + dy))
  swipe.onClick(pointerClick)
}

describe('useSwipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reports a press that barely moves as a tap', () => {
    drag(SWIPE_MIN_DISTANCE - 1, 0)

    expect(onTap).toHaveBeenCalledOnce()
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('reports a leftward drag as a swipe left, and swallows its click', () => {
    drag(-SWIPE_MIN_DISTANCE, 0)

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onTap).not.toHaveBeenCalled()
  })

  it('reports a rightward drag as a swipe right', () => {
    drag(SWIPE_MIN_DISTANCE * 2, 10)
    expect(onSwipeRight).toHaveBeenCalledOnce()
  })

  it('leaves a mostly vertical drag to the page scroll', () => {
    const dy = 100
    drag(SWIPE_HORIZONTAL_RATIO * dy - 1, dy)

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('ignores a release with no press, and a cancelled press', () => {
    const swipe = setup()
    swipe.onPointerUp(at(0, 0))
    swipe.onPointerDown(at(0, 0))
    swipe.onPointerCancel()
    swipe.onPointerUp(at(-200, 0))

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('still taps from the keyboard right after a swipe', () => {
    const swipe = setup()
    swipe.onPointerDown(at(200, 200))
    swipe.onPointerUp(at(0, 200))
    swipe.onClick(keyboardClick)

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onTap).toHaveBeenCalledOnce()
  })
})
