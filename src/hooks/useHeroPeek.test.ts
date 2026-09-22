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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useHeroPeek } from './useHeroPeek'

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', { value, writable: true, configurable: true })
}

describe('useHeroPeek', () => {
  const scrollTo = vi.fn()

  beforeEach(() => {
    scrollTo.mockClear()
    vi.stubGlobal('scrollTo', scrollTo)
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
    setScrollY(0)
    // replaceState rather than assigning hash, which jsdom treats as navigation
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reveals a slice of the next section by default', () => {
    renderHook(() => useHeroPeek())

    expect(scrollTo).toHaveBeenCalledWith({ top: 140, behavior: 'auto' })
  })

  it('accepts an explicit peek', () => {
    renderHook(() => useHeroPeek(0.25))

    expect(scrollTo).toHaveBeenCalledWith({ top: 250, behavior: 'auto' })
  })

  it('leaves an anchored visit where it landed', () => {
    window.history.replaceState(null, '', '#work')

    renderHook(() => useHeroPeek())

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('leaves a restored position alone', () => {
    setScrollY(300)

    renderHook(() => useHeroPeek())

    expect(scrollTo).not.toHaveBeenCalled()
  })
})
