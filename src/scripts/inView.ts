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

/** How much of the element has to show before it counts as in view. */
const DEFAULT_ENTER = 0.3

// True at the enter ratio, false only once fully gone, so a scroll on the boundary cannot flap.
// Without an IntersectionObserver it reports true at once, as running early beats never running.
export function watchInView(
  target: Element,
  onChange: (inView: boolean) => void,
  enter: number = DEFAULT_ENTER,
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true)
    return () => {}
  }

  let inView = false
  const report = (next: boolean) => {
    if (next === inView) return
    inView = next
    onChange(next)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= enter) report(true)
        else if (entry.intersectionRatio === 0) report(false)
      }
    },
    { threshold: [0, enter] },
  )

  observer.observe(target)

  return () => observer.disconnect()
}
