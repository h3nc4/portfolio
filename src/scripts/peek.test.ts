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

import { afterEach, describe, expect, it, vi } from 'vitest'

import { HERO_PEEK, peekHero } from './peek'

function fakeWindow({ hash = '', scrollY = 0 } = {}) {
  const scrollTo = vi.fn()
  const win = { location: { hash }, scrollY, innerHeight: 1000, scrollTo } as unknown as Window
  return { win, scrollTo }
}

describe('peekHero', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('scrolls a slice of the next section into view', () => {
    const { win, scrollTo } = fakeWindow()

    peekHero(win)

    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1000 * HERO_PEEK, behavior: 'auto' })
  })

  it('peeks by 14% of the viewport', () => {
    expect(HERO_PEEK).toBe(0.14)
  })

  it('accepts another peek', () => {
    const { win, scrollTo } = fakeWindow()

    peekHero(win, 0.25)

    expect(scrollTo).toHaveBeenCalledWith({ top: 250, behavior: 'auto' })
  })

  it('leaves an anchored visit where it landed', () => {
    const { win, scrollTo } = fakeWindow({ hash: '#work' })

    peekHero(win)

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('leaves a restored position alone', () => {
    const { win, scrollTo } = fakeWindow({ scrollY: 300 })

    peekHero(win)

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('scrolls the global window by default', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    peekHero()

    expect(scrollTo).toHaveBeenCalledWith({ top: innerHeight * HERO_PEEK, behavior: 'auto' })
  })
})
