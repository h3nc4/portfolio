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

import { tween } from '@/scripts/tween'

/** How far up the viewport a top has to rise, as a fraction, when `data-threshold` is absent. */
const DEFAULT_THRESHOLD = 0.1

/** How far an entrance rises into place, in px, and how long it takes, in ms. */
export const REVEAL_DISTANCE = 20
export const REVEAL_DURATION = 800

const SECOND = 1000

/** Where a `data-painted` reveal rests, as `index.css` sets it. */
export const PAINTED_OPACITY = 0.01

function line(el: HTMLElement, viewport: number): number {
  return viewport * (1 - Number(el.dataset.threshold ?? DEFAULT_THRESHOLD))
}

function play(el: HTMLElement) {
  const rest = 'painted' in el.dataset ? PAINTED_OPACITY : 0
  tween({
    duration: REVEAL_DURATION,
    delay: Number(el.dataset.delay ?? 0) * SECOND,
    onUpdate: (progress) => {
      el.style.opacity = String(rest + (1 - rest) * progress)
      el.style.transform = `translate(0px, ${REVEAL_DISTANCE * (1 - progress)}px)`
    },
  })
}

// Plays each `.reveal` once its top crosses its line, a jump past it included. It checks in the
// scroll event itself, as ScrollTrigger did, since a frame's wait showed as a late start.
export function startReveals(root: ParentNode = document): () => void {
  const pending = new Set(root.querySelectorAll<HTMLElement>('.reveal'))

  const stop = () => {
    removeEventListener('scroll', check)
    removeEventListener('resize', check)
  }

  function check() {
    for (const el of pending) {
      if (el.getBoundingClientRect().top > line(el, innerHeight)) continue
      pending.delete(el)
      play(el)
    }
    if (pending.size === 0) stop()
  }

  addEventListener('scroll', check, { passive: true })
  addEventListener('resize', check)
  check()

  return stop
}
