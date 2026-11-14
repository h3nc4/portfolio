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

import { afterLoad } from './afterLoad'

const IDLE_HANDLE = 7

// A window that holds only what afterLoad reads, so a test sets its load state and idle support.
function fakeWindow(readyState: DocumentReadyState, { idle }: { idle: boolean }) {
  const target = new EventTarget()
  const win = {
    document: { readyState },
    addEventListener: vi.fn(target.addEventListener.bind(target)),
    removeEventListener: vi.fn(target.removeEventListener.bind(target)),
    requestIdleCallback: idle
      ? vi.fn<(cb: IdleRequestCallback, options?: IdleRequestOptions) => number>(() => IDLE_HANDLE)
      : undefined,
    cancelIdleCallback: vi.fn(),
  }
  const load = () => target.dispatchEvent(new Event('load'))
  const goIdle = () => win.requestIdleCallback!.mock.calls[0][0]({} as IdleDeadline)
  return { win, asWindow: win as unknown as Window, load, goIdle }
}

describe('afterLoad', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs on the next tick when the page has loaded and idle callbacks are missing', () => {
    const run = vi.fn()
    afterLoad(run, fakeWindow('complete', { idle: false }).asWindow)

    expect(run).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(run).toHaveBeenCalledOnce()
  })

  it('waits for an idle moment, with a timeout', () => {
    const run = vi.fn()
    const { win, asWindow, goIdle } = fakeWindow('complete', { idle: true })
    afterLoad(run, asWindow)

    expect(win.requestIdleCallback).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 })
    vi.runAllTimers()
    expect(run).not.toHaveBeenCalled()

    goIdle()
    expect(run).toHaveBeenCalledOnce()
  })

  it('waits for the load event while the page is still loading', () => {
    const run = vi.fn()
    const { asWindow, load } = fakeWindow('loading', { idle: false })
    afterLoad(run, asWindow)

    vi.runAllTimers()
    expect(run).not.toHaveBeenCalled()

    load()
    vi.runAllTimers()
    expect(run).toHaveBeenCalledOnce()
  })

  it('listens for a single load event', () => {
    const run = vi.fn()
    const { asWindow, load } = fakeWindow('loading', { idle: false })
    afterLoad(run, asWindow)

    load()
    load()
    vi.runAllTimers()
    expect(run).toHaveBeenCalledOnce()
  })

  it('stops listening for load once cancelled', () => {
    const run = vi.fn()
    const { win, asWindow, load } = fakeWindow('loading', { idle: false })
    const cancel = afterLoad(run, asWindow)

    cancel()
    load()
    vi.runAllTimers()

    expect(win.removeEventListener).toHaveBeenCalledWith('load', expect.any(Function))
    expect(run).not.toHaveBeenCalled()
  })

  it('cancels a pending idle callback', () => {
    const { win, asWindow } = fakeWindow('complete', { idle: true })
    const cancel = afterLoad(vi.fn(), asWindow)

    cancel()
    expect(win.cancelIdleCallback).toHaveBeenCalledWith(IDLE_HANDLE)
  })

  it('clears a pending timer', () => {
    const run = vi.fn()
    const cancel = afterLoad(run, fakeWindow('complete', { idle: false }).asWindow)

    cancel()
    vi.runAllTimers()
    expect(run).not.toHaveBeenCalled()
  })

  it('cancels nothing once it has run', () => {
    const { win, asWindow, goIdle } = fakeWindow('complete', { idle: true })
    const cancel = afterLoad(vi.fn(), asWindow)

    goIdle()
    cancel()
    expect(win.cancelIdleCallback).not.toHaveBeenCalled()
  })

  it('defaults to the current window', async () => {
    vi.useRealTimers()
    const run = vi.fn()
    afterLoad(run)

    await vi.waitFor(() => expect(run).toHaveBeenCalledOnce())
  })
})
