import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { REVEAL_DISTANCE, REVEAL_DURATION, startReveals } from './reveal'

/** Where a top crosses into view under the default threshold. */
const LINE = () => innerHeight * (1 - 0.1)

let root: HTMLElement

/** A `.reveal` whose top sits wherever `top.value` says. */
function reveal(top: number, data: Record<string, string> = {}, parent: HTMLElement = root) {
  const el = document.createElement('div')
  el.className = 'reveal'
  Object.assign(el.dataset, data)
  const position = { value: top }
  vi.spyOn(el, 'getBoundingClientRect').mockImplementation(
    () => ({ top: position.value }) as DOMRect,
  )
  parent.append(el)
  return { el, position }
}

function riseOf(el: HTMLElement): number {
  const match = /^translate\(0px, (-?[\d.e-]+)px\)$/.exec(el.style.transform)
  return Number(match?.[1])
}

function isDone(el: HTMLElement) {
  return el.style.opacity === '1' && el.style.transform === 'translate(0px, 0px)'
}

describe('startReveals', () => {
  let stop: () => void = () => {}

  beforeEach(() => {
    Object.defineProperty(document, 'timeline', { value: undefined, configurable: true })
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    root = document.createElement('div')
    document.body.append(root)
  })

  afterEach(() => {
    stop()
    stop = () => {}
    root.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
    Reflect.deleteProperty(document, 'timeline')
  })

  it('rises 20px into place over 800ms', () => {
    expect(REVEAL_DISTANCE).toBe(20)
    expect(REVEAL_DURATION).toBe(800)
  })

  it('plays an element whose top is at its line', () => {
    const { el } = reveal(LINE())

    stop = startReveals(root)
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(isDone(el)).toBe(true)
  })

  it('plays one already scrolled past', () => {
    const { el } = reveal(-5000)

    stop = startReveals(root)
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(isDone(el)).toBe(true)
  })

  it('fades in from 0 as it rises from 20px', () => {
    const { el } = reveal(LINE())

    stop = startReveals(root)
    vi.advanceTimersByTime(20)
    const first = Number(el.style.opacity)
    vi.advanceTimersByTime(REVEAL_DURATION / 4)
    const later = Number(el.style.opacity)

    expect(first).toBeGreaterThan(0)
    expect(first).toBeLessThan(0.2)
    expect(riseOf(el)).toBeCloseTo(REVEAL_DISTANCE * (1 - later), 3)
    expect(later).toBeGreaterThan(first)
    expect(later).toBeLessThan(1)
  })

  it('holds an element below its line', () => {
    const { el } = reveal(LINE() + 1)

    stop = startReveals(root)
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(el).not.toHaveAttribute('style')
  })

  it('starts an entrance inside the scroll event that brings it in', () => {
    const { el, position } = reveal(LINE() + 1)
    stop = startReveals(root)
    const frames = vi.spyOn(window, 'requestAnimationFrame')

    position.value = LINE()
    dispatchEvent(new Event('scroll'))
    expect(frames).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(REVEAL_DURATION)
    expect(isDone(el)).toBe(true)
  })

  it('checks again on resize', () => {
    const { el, position } = reveal(LINE() + 1)
    stop = startReveals(root)

    position.value = LINE()
    dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(isDone(el)).toBe(true)
  })

  it('takes its line from data-threshold', () => {
    const low = reveal(innerHeight * 0.6, { threshold: '0.5' })
    const high = reveal(innerHeight * 0.5, { threshold: '0.5' })

    stop = startReveals(root)
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(low.el).not.toHaveAttribute('style')
    expect(isDone(high.el)).toBe(true)
  })

  it('waits data-delay seconds before it starts', () => {
    const { el } = reveal(LINE(), { delay: '0.5' })

    stop = startReveals(root)
    vi.advanceTimersByTime(480)
    expect(el).not.toHaveAttribute('style')

    vi.advanceTimersByTime(500 + REVEAL_DURATION - 480)
    expect(isDone(el)).toBe(true)
  })

  it('plays each element once', () => {
    reveal(LINE())
    reveal(LINE() + 1)
    stop = startReveals(root)
    vi.advanceTimersByTime(REVEAL_DURATION)
    const frames = vi.spyOn(window, 'requestAnimationFrame')

    dispatchEvent(new Event('scroll'))
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(frames).not.toHaveBeenCalled()
  })

  it('stops listening once every element has played', () => {
    const added = vi.spyOn(window, 'addEventListener')
    const removed = vi.spyOn(window, 'removeEventListener')
    const { position } = reveal(LINE() + 1)
    reveal(LINE())

    stop = startReveals(root)
    expect(removed).not.toHaveBeenCalled()

    position.value = LINE()
    dispatchEvent(new Event('scroll'))
    const check = added.mock.calls[0][1]
    expect(removed).toHaveBeenCalledWith('scroll', check)
    expect(removed).toHaveBeenCalledWith('resize', check)
  })

  it('stops listening through its return', () => {
    const { el, position } = reveal(LINE() + 1)

    startReveals(root)()
    position.value = LINE()
    dispatchEvent(new Event('scroll'))
    dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(el).not.toHaveAttribute('style')
  })

  it('looks through the whole document by default', () => {
    const { el } = reveal(LINE(), {}, document.body)

    stop = startReveals()
    vi.advanceTimersByTime(REVEAL_DURATION)

    expect(isDone(el)).toBe(true)
    el.remove()
  })
})
