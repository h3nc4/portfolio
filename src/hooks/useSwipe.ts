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

import { type MouseEvent, type PointerEvent, useRef } from 'react'

/** Shortest horizontal travel, in pixels, that counts as a swipe. */
export const SWIPE_MIN_DISTANCE = 40
/** A swipe has to travel this many times further across than down. */
export const SWIPE_HORIZONTAL_RATIO = 2

interface SwipeActions {
  readonly onTap: () => void
  readonly onSwipeLeft: () => void
  readonly onSwipeRight: () => void
}

// Tells a tap from a horizontal swipe. A mostly vertical drag is ignored, so an
// element with `touch-pan-y` still lets the page scroll under a finger.
export function useSwipe({ onTap, onSwipeLeft, onSwipeRight }: SwipeActions) {
  const start = useRef<{ x: number; y: number } | null>(null)
  const swiped = useRef(false)

  return {
    onPointerDown(event: PointerEvent) {
      start.current = { x: event.clientX, y: event.clientY }
      swiped.current = false
    },
    onPointerUp(event: PointerEvent) {
      if (!start.current) return
      const dx = event.clientX - start.current.x
      const dy = event.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return
      if (Math.abs(dx) < SWIPE_HORIZONTAL_RATIO * Math.abs(dy)) return

      swiped.current = true
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    },
    onPointerCancel() {
      start.current = null
    },
    // A mouse drag still ends in a click, which must not count as a tap too
    onClick(event: MouseEvent) {
      if (swiped.current && event.detail > 0) return
      onTap()
    },
  }
}
