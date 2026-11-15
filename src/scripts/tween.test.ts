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

import { expoOut, frameTime, power3Out, tween } from './tween'

const TICK_MS = 1000 / 60

/** A window whose frames run only when a test calls `frame(now)`. */
function fakeWindow(currentTime: number | null = TICK_MS, now = 0) {
  let queue = new Map<number, FrameRequestCallback>()
  let nextId = 0
  const win = {
    document: { timeline: { currentTime } },
    performance: { now: () => now },
    requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => {
      queue.set(++nextId, cb)
      return nextId
    }),
    cancelAnimationFrame: vi.fn((id: number) => queue.delete(id)),
  }
  const frame = (time: number) => {
    const callbacks = [...queue.values()]
    queue = new Map()
    for (const cb of callbacks) cb(time)
  }
  return { win: win as unknown as Window, raw: win, frame, pending: () => queue.size }
}

describe('expoOut', () => {
  it('is the exponential GSAP calls expo.out', () => {
    expect(expoOut(0)).toBe(0)
    expect(expoOut(0.1)).toBeCloseTo(0.5)
    expect(expoOut(0.5)).toBeCloseTo(0.96875)
  })

  it('lands on exactly 1, which the formula alone never reaches', () => {
    expect(expoOut(1)).toBe(1)
  })
})

describe('power3Out', () => {
  it('is the quartic GSAP calls power3.out', () => {
    for (const t of [0, 0.25, 0.5, 0.75, 1]) expect(power3Out(t)).toBeCloseTo(1 - (1 - t) ** 4)
  })

  it('starts at 0 and ends at 1', () => {
    expect(power3Out(0)).toBe(0)
    expect(power3Out(1)).toBe(1)
  })
})

describe('frameTime', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'timeline')
    vi.restoreAllMocks()
  })

  it('is the document timeline one 60Hz frame back', () => {
    const { win } = fakeWindow(500, 900)
    expect(frameTime(win)).toBeCloseTo(500 - TICK_MS)
  })

  it('falls back to the performance clock when the timeline has no time', () => {
    const { win } = fakeWindow(null, 900)
    expect(frameTime(win)).toBeCloseTo(900 - TICK_MS)
  })

  it('falls back to the performance clock when there is no timeline', () => {
    const { win, raw } = fakeWindow(0, 900)
    Reflect.deleteProperty(raw.document, 'timeline')
    expect(frameTime(win)).toBeCloseTo(900 - TICK_MS)
  })

  it('reads the global window by default', () => {
    Object.defineProperty(document, 'timeline', { value: undefined, configurable: true })
    vi.spyOn(performance, 'now').mockReturnValue(1234)
    expect(frameTime()).toBeCloseTo(1234 - TICK_MS)
  })
})

describe('tween', () => {
  afterEach(() => {
    Reflect.deleteProperty(document, 'timeline')
    vi.useRealTimers()
  })

  it('reports the eased progress once a frame and exactly 1 on the last', () => {
    const { win, frame, pending } = fakeWindow()
    const onUpdate = vi.fn()

    tween({ duration: 100, onUpdate, win })
    frame(50)
    frame(130)

    expect(onUpdate.mock.calls).toEqual([[power3Out(0.5)], [1]])
    expect(pending()).toBe(0)
  })

  it('stops requesting frames once it is done', () => {
    const { win, raw, frame } = fakeWindow()

    tween({ duration: 100, onUpdate: () => {}, win })
    frame(100)
    frame(200)

    expect(raw.requestAnimationFrame).toHaveBeenCalledTimes(1)
  })

  it('reports nothing before its delay has elapsed', () => {
    const { win, frame, pending } = fakeWindow()
    const onUpdate = vi.fn()

    tween({ duration: 100, delay: 200, onUpdate, win })
    frame(100)
    frame(199)

    expect(onUpdate).not.toHaveBeenCalled()
    expect(pending()).toBe(1)

    frame(250)
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(power3Out(0.5))
  })

  it('takes another ease', () => {
    const { win, frame } = fakeWindow()
    const onUpdate = vi.fn()

    tween({ duration: 100, ease: (t) => t, onUpdate, win })
    frame(25)

    expect(onUpdate).toHaveBeenCalledWith(0.25)
  })

  it('cancels the pending frame through its return', () => {
    const { win, raw, frame } = fakeWindow()
    const onUpdate = vi.fn()

    const cancel = tween({ duration: 100, onUpdate, win })
    frame(50)
    cancel()
    frame(100)

    expect(raw.cancelAnimationFrame).toHaveBeenCalledWith(2)
    expect(onUpdate).toHaveBeenCalledTimes(1)
  })

  it('runs on the global window by default', () => {
    Object.defineProperty(document, 'timeline', { value: undefined, configurable: true })
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    const onUpdate = vi.fn()

    tween({ duration: 100, onUpdate })
    vi.advanceTimersByTime(200)

    expect(onUpdate).toHaveBeenCalled()
    expect(onUpdate).toHaveBeenLastCalledWith(1)
  })
})
