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

import { useEffect } from 'react'

/** How much of the next section to reveal, as a fraction of the viewport. */
const DEFAULT_PEEK = 0.14

/**
 * Nudges the page down on first paint so the section under the hero is visible.
 * The hero fills the viewport, which would otherwise look like the whole page,
 * and scrolling up still reaches the top where the painting is unobstructed.
 *
 * It yields to a restored position and to an anchor, since both mean the
 * visitor already has somewhere else to be.
 */
export function useHeroPeek(peek: number = DEFAULT_PEEK) {
  useEffect(() => {
    if (window.location.hash) {
      return
    }

    if (window.scrollY > 0) {
      return
    }

    // Instant rather than smooth: an animation on first paint reads as a fault.
    window.scrollTo({ top: window.innerHeight * peek, behavior: 'auto' })
  }, [peek])
}
