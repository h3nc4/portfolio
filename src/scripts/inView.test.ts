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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { watchInView } from './inView'

type Callback = (entries: IntersectionObserverEntry[]) => void

/** A stand-in observer, with a hook for a test to pick the ratio. */
class FakeObserver {
  static last: FakeObserver | undefined
  readonly observe = vi.fn()
  readonly disconnect = vi.fn()
  readonly options?: IntersectionObserverInit

  private readonly callback: Callback

  constructor(callback: Callback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.options = options
    FakeObserver.last = this
  }

  report(...ratios: number[]) {
    this.callback(
      ratios.map((ratio) => ({ intersectionRatio: ratio }) as IntersectionObserverEntry),
    )
  }
}

function observer() {
  return FakeObserver.last!
}

describe('watchInView', () => {
  const onChange = vi.fn()

  beforeEach(() => {
    FakeObserver.last = undefined
    onChange.mockReset()
    vi.stubGlobal('IntersectionObserver', FakeObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts out of view and reports nothing until the observer does', () => {
    watchInView(document.createElement('div'), onChange)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('comes into view once enough of the element shows', () => {
    watchInView(document.createElement('div'), onChange)

    observer().report(0.3)

    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('holds its state between the two thresholds, so a resting scroll cannot flap', () => {
    watchInView(document.createElement('div'), onChange)

    observer().report(0.3)
    observer().report(0.1)

    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('leaves view only once the element has gone entirely', () => {
    watchInView(document.createElement('div'), onChange)

    observer().report(0.9)
    observer().report(0)

    expect(onChange.mock.calls).toEqual([[true], [false]])
  })

  it('never reports the same value twice in a row', () => {
    watchInView(document.createElement('div'), onChange)

    observer().report(0)
    observer().report(0.5, 1)
    observer().report(0, 0)

    expect(onChange.mock.calls).toEqual([[true], [false]])
  })

  it('observes the element against both thresholds', () => {
    const el = document.createElement('div')

    watchInView(el, onChange)

    expect(observer().observe).toHaveBeenCalledWith(el)
    expect(observer().options).toEqual({ threshold: [0, 0.3] })
  })

  it('takes an explicit enter ratio', () => {
    watchInView(document.createElement('div'), onChange, 0.75)

    expect(observer().options).toEqual({ threshold: [0, 0.75] })

    observer().report(0.5)
    expect(onChange).not.toHaveBeenCalled()

    observer().report(0.8)
    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
  })

  it('disconnects when stopped', () => {
    const stop = watchInView(document.createElement('div'), onChange)

    stop()

    expect(observer().disconnect).toHaveBeenCalledOnce()
  })

  it('reports true at once where the browser has no observer, since silence is worse', () => {
    vi.stubGlobal('IntersectionObserver', undefined)

    const stop = watchInView(document.createElement('div'), onChange)

    expect(onChange).toHaveBeenCalledExactlyOnceWith(true)
    expect(stop).not.toThrow()
  })
})
