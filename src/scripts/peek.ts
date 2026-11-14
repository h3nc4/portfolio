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

/** How much of the next section to reveal, as a fraction of the viewport. */
export const HERO_PEEK = 0.14

// The hero fills the viewport and would pass for the whole page, so the first paint scrolls the
// next section into view. A restored position or an anchor already has somewhere to be.
export function peekHero(win: Window = window, peek: number = HERO_PEEK) {
  if (win.location.hash || win.scrollY > 0) return

  win.scrollTo({ top: win.innerHeight * peek, behavior: 'auto' })
}

// Chrome stops collecting the largest paint once the page scrolls, and a peek in the first
// frames left mobile with no LCP at all, so it waits until a frame has been drawn.
export function peekAfterPaint(win: Window = window) {
  win.requestAnimationFrame(() => win.requestAnimationFrame(() => peekHero(win)))
}
