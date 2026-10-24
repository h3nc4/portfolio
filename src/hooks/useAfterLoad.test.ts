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

import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useAfterLoad } from './useAfterLoad'

function setReadyState(state: DocumentReadyState) {
  Object.defineProperty(document, 'readyState', { configurable: true, get: () => state })
}

describe('useAfterLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'readyState')
  })

  it('turns true on the next tick when the page has loaded and idle callbacks are missing', () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    setReadyState('complete')
    const { result } = renderHook(() => useAfterLoad())

    expect(result.current).toBe(false)
    act(() => {
      vi.runAllTimers()
    })
    expect(result.current).toBe(true)
  })

  it('waits for an idle moment, with a timeout', () => {
    const idle = vi.fn<(cb: IdleRequestCallback, options?: IdleRequestOptions) => number>(() => 7)
    vi.stubGlobal('requestIdleCallback', idle)
    vi.stubGlobal('cancelIdleCallback', vi.fn())
    setReadyState('complete')
    const { result } = renderHook(() => useAfterLoad())

    expect(idle).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 })
    act(() => {
      idle.mock.calls[0][0]({} as IdleDeadline)
    })
    expect(result.current).toBe(true)
  })

  it('waits for the load event while the page is still loading', () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    setReadyState('loading')
    const { result } = renderHook(() => useAfterLoad())

    act(() => {
      vi.runAllTimers()
    })
    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('load'))
      vi.runAllTimers()
    })
    expect(result.current).toBe(true)
  })

  it('cancels a pending idle callback on unmount', () => {
    const cancel = vi.fn()
    vi.stubGlobal(
      'requestIdleCallback',
      vi.fn(() => 7),
    )
    vi.stubGlobal('cancelIdleCallback', cancel)
    setReadyState('complete')
    const { unmount } = renderHook(() => useAfterLoad())

    unmount()
    expect(cancel).toHaveBeenCalledWith(7)
  })

  it('clears a pending timer on unmount', () => {
    vi.stubGlobal('requestIdleCallback', undefined)
    setReadyState('complete')
    const { result, unmount } = renderHook(() => useAfterLoad())

    unmount()
    act(() => {
      vi.runAllTimers()
    })
    expect(result.current).toBe(false)
  })
})
