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
import { type RefObject } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useInView } from './useInView'

type Callback = (entries: IntersectionObserverEntry[]) => void

/** The observer jsdom lacks, with a hook for a test to pick the ratio. */
class FakeObserver {
  static last: FakeObserver | undefined
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()
  readonly disconnect = vi.fn()
  readonly options?: IntersectionObserverInit

  private readonly callback: Callback

  constructor(callback: Callback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    FakeObserver.last = this
  }

  report(ratio: number) {
    act(() => {
      this.callback([{ intersectionRatio: ratio } as IntersectionObserverEntry])
    })
  }
}

function refTo(el: Element | null): RefObject<Element | null> {
  return { current: el }
}

describe('useInView', () => {
  beforeEach(() => {
    FakeObserver.last = undefined
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts out of view, so a caller waits', () => {
    const { result } = renderHook(() => useInView(refTo(document.createElement('div'))))

    expect(result.current).toBe(false)
  })

  it('comes into view once enough of the element shows', () => {
    const { result } = renderHook(() => useInView(refTo(document.createElement('div'))))

    FakeObserver.last?.report(0.3)

    expect(result.current).toBe(true)
  })

  it('holds its state between the two thresholds, so a resting scroll cannot flap', () => {
    const { result } = renderHook(() => useInView(refTo(document.createElement('div'))))

    FakeObserver.last?.report(0.3)
    FakeObserver.last?.report(0.1)

    expect(result.current).toBe(true)
  })

  it('leaves view only once the element has gone entirely', () => {
    const { result } = renderHook(() => useInView(refTo(document.createElement('div'))))

    FakeObserver.last?.report(0.9)
    FakeObserver.last?.report(0)

    expect(result.current).toBe(false)
  })

  it('observes the element against both thresholds', () => {
    const el = document.createElement('div')

    renderHook(() => useInView(refTo(el)))

    expect(FakeObserver.last?.observe).toHaveBeenCalledWith(el)
    expect(FakeObserver.last?.options).toEqual({ threshold: [0, 0.3] })
  })

  it('takes an explicit enter ratio', () => {
    const { result } = renderHook(() => useInView(refTo(document.createElement('div')), 0.75))

    expect(FakeObserver.last?.options).toEqual({ threshold: [0, 0.75] })

    FakeObserver.last?.report(0.5)
    expect(result.current).toBe(false)

    FakeObserver.last?.report(0.8)
    expect(result.current).toBe(true)
  })

  it('observes nothing before the element mounts', () => {
    renderHook(() => useInView(refTo(null)))

    expect(FakeObserver.last).toBeUndefined()
  })

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useInView(refTo(document.createElement('div'))))
    const observer = FakeObserver.last

    unmount()

    expect(observer?.disconnect).toHaveBeenCalledTimes(1)
  })

  it('reports true where the browser has no observer, since silence is worse', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const { result } = renderHook(() => useInView(refTo(document.createElement('div'))))

    expect(result.current).toBe(true)
  })
})
