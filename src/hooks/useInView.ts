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

import { type RefObject, useEffect, useState } from 'react'

/** How much of the element has to show before it counts as in view. */
const DEFAULT_ENTER = 0.3

/**
 * Whether an element is on screen, for work that should wait until it is.
 *
 * It turns true at the enter ratio and false only once the element has left
 * entirely. Separating those thresholds gives it hysteresis, and a scroll
 * resting on the boundary cannot flap. Without an IntersectionObserver it
 * reports true from the start, since a caller that never runs is worse than one
 * that runs early.
 */
export function useInView<T extends Element>(
  target: RefObject<T | null>,
  enter: number = DEFAULT_ENTER,
): boolean {
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = target.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio >= enter) setInView(true)
          else if (entry.intersectionRatio === 0) setInView(false)
        }
      },
      { threshold: [0, enter] },
    )

    observer.observe(el)

    return () => observer.disconnect()
  }, [target, enter])

  return inView
}
