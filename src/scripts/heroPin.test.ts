import { afterEach, describe, expect, it, vi } from 'vitest'

import { heroStyle, pinHero, progressAt, SCRUB_MS } from './heroPin'
import { frameTime, power3Out } from './tween'

const TICK_MS = 1000 / 60

interface Options {
  reduce?: boolean
  touch?: boolean
  scrollY?: number
  width?: number
  height?: number
}

/** A window driven by hand: its scroll, size and frames change only when a test says so. */
function fakeWindow({
  reduce = false,
  touch = false,
  scrollY = 0,
  width = 400,
  height = 1000,
}: Options = {}) {
  let queue = new Map<number, FrameRequestCallback>()
  let nextId = 0
  const raw = Object.assign(new EventTarget(), {
    innerWidth: width,
    innerHeight: height,
    scrollY,
    matchMedia: vi.fn(() => ({ matches: reduce })),
    document: {
      documentElement: touch ? { ontouchstart: null } : {},
      timeline: { currentTime: TICK_MS },
    },
    performance: { now: () => 0 },
    requestAnimationFrame: vi.fn((cb: FrameRequestCallback) => {
      queue.set(++nextId, cb)
      return nextId
    }),
    cancelAnimationFrame: vi.fn((id: number) => queue.delete(id)),
  })
  const win = raw as unknown as Window
  return {
    win,
    raw,
    pending: () => queue.size,
    frame(time: number) {
      const callbacks = [...queue.values()]
      queue = new Map()
      for (const cb of callbacks) cb(time)
    },
    /** Sets the clock a scroll reads its start from, so `startedAt` is `time`. */
    at(time: number) {
      raw.document.timeline.currentTime = time + TICK_MS
    },
    scroll(y: number) {
      raw.scrollY = y
      raw.dispatchEvent(new Event('scroll'))
    },
    resize(w: number, h: number) {
      raw.innerWidth = w
      raw.innerHeight = h
      raw.dispatchEvent(new Event('resize'))
    },
  }
}

function hero() {
  return { style: {} } as HTMLElement
}

describe('heroStyle', () => {
  it('leaves the hero untouched at rest', () => {
    expect(heroStyle(0)).toEqual({
      transform: 'translate(0%, 0%) scale(1)',
      opacity: '1',
      visibility: 'inherit',
      filter: 'blur(0px)',
    })
  })

  it('shrinks, lifts, blurs and hides it once gone', () => {
    expect(heroStyle(1)).toEqual({
      transform: 'translate(0%, -6%) scale(0.86)',
      opacity: '0',
      visibility: 'hidden',
      filter: 'blur(3px)',
    })
  })

  it('is halfway at half progress and still visible', () => {
    const style = heroStyle(0.5)

    expect(style.opacity).toBe('0.5')
    expect(style.visibility).toBe('inherit')
    expect(style.filter).toBe('blur(1.5px)')
    expect(style.transform).toMatch(/^translate\(0%, -3%\) scale\(0\.9299/)
  })

  it('keeps it visible just short of the end', () => {
    expect(heroStyle(0.99).visibility).toBe('inherit')
  })
})

describe('progressAt', () => {
  it('is 0 up to the peek offset', () => {
    expect(progressAt(0, 1000)).toBe(0)
    expect(progressAt(140, 1000)).toBe(0)
  })

  it('is 1 from 106% of the viewport on', () => {
    expect(progressAt(1060, 1000)).toBe(1)
    expect(progressAt(5000, 1000)).toBe(1)
  })

  it('is linear between', () => {
    expect(progressAt(600, 1000)).toBeCloseTo(0.5)
    expect(progressAt(140 + 920 / 4, 1000)).toBeCloseTo(0.25)
  })

  it('scales with the viewport', () => {
    expect(progressAt(300, 500)).toBeCloseTo(0.5)
  })
})

describe('pinHero', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('does nothing when motion is reduced', () => {
    const { win, raw, pending, scroll } = fakeWindow({ reduce: true, scrollY: 600 })
    const el = hero()

    const stop = pinHero(el, win)
    scroll(1060)

    expect(raw.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(el.style).toEqual({})
    expect(pending()).toBe(0)
    expect(stop).not.toThrow()
  })

  it('reads the global window by default', () => {
    const matchMedia = vi.fn(() => ({ matches: true }))
    vi.stubGlobal('matchMedia', matchMedia)
    const el = hero()

    pinHero(el)

    expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    expect(el.style).toEqual({})
  })

  it('styles the hero for the scroll it loads at', () => {
    const { win, pending } = fakeWindow({ scrollY: 600 })
    const el = hero()

    pinHero(el, win)

    expect(el.style).toEqual(heroStyle(progressAt(600, 1000)))
    expect(pending()).toBe(0)
  })

  it('eases toward a new scroll with power3Out over 600ms', () => {
    const { win, frame, pending, at, scroll } = fakeWindow()
    const el = hero()
    pinHero(el, win)

    at(1000)
    scroll(1060)
    frame(1300)
    expect(el.style).toEqual(heroStyle(power3Out(0.5)))

    frame(1600)
    expect(el.style).toEqual(heroStyle(1))
    expect(pending()).toBe(0)
  })

  it('starts the scrub from the frame before the scroll', () => {
    const { win, raw, frame, scroll } = fakeWindow()
    const el = hero()
    pinHero(el, win)

    scroll(1060)
    frame(frameTime(win) + SCRUB_MS / 4)

    expect(raw.document.timeline.currentTime).toBe(TICK_MS)
    expect(el.style).toEqual(heroStyle(power3Out(0.25)))
  })

  it('retargets a scrub in flight from where it shows', () => {
    const { win, raw, frame, pending, at, scroll } = fakeWindow()
    const el = hero()
    pinHero(el, win)

    at(0)
    scroll(1060)
    frame(SCRUB_MS / 2)
    const midway = power3Out(0.5)

    at(SCRUB_MS / 2)
    scroll(0)
    expect(raw.requestAnimationFrame).toHaveBeenCalledTimes(2)
    expect(pending()).toBe(1)

    frame(SCRUB_MS)
    expect(el.style).toEqual(heroStyle(midway * (1 - power3Out(0.5))))

    frame(SCRUB_MS * 1.5)
    expect(el.style).toEqual(heroStyle(0))
  })

  it('ignores a mobile toolbar resizing the viewport', () => {
    const { win, frame, pending, at, resize, scroll } = fakeWindow({ touch: true, scrollY: 600 })
    const el = hero()
    pinHero(el, win)

    resize(400, 850)
    expect(pending()).toBe(0)

    at(0)
    scroll(600)
    frame(SCRUB_MS)
    expect(el.style).toEqual(heroStyle(progressAt(600, 1000)))
  })

  it('re-measures when a touch device changes height by a quarter or more', () => {
    const { win, frame, at, resize } = fakeWindow({ touch: true, scrollY: 600 })
    const el = hero()
    pinHero(el, win)

    at(0)
    resize(400, 750)
    frame(SCRUB_MS)

    expect(el.style).toEqual(heroStyle(progressAt(600, 750)))
  })

  it('re-measures when a touch device changes width', () => {
    const { win, frame, at, resize } = fakeWindow({ touch: true, scrollY: 600 })
    const el = hero()
    pinHero(el, win)

    at(0)
    resize(800, 900)
    frame(SCRUB_MS)

    expect(el.style).toEqual(heroStyle(progressAt(600, 900)))
  })

  it('re-measures any resize without touch', () => {
    const { win, frame, at, resize } = fakeWindow({ scrollY: 600 })
    const el = hero()
    pinHero(el, win)

    at(0)
    resize(400, 900)
    frame(SCRUB_MS)

    expect(el.style).toEqual(heroStyle(progressAt(600, 900)))
  })

  it('cancels a scrub in flight when torn down', () => {
    const { win, raw, pending, scroll } = fakeWindow()
    const stop = pinHero(hero(), win)
    scroll(600)

    stop()

    expect(raw.cancelAnimationFrame).toHaveBeenCalledWith(1)
    expect(pending()).toBe(0)
  })

  it('stops listening when torn down', () => {
    const { win, raw, scroll, resize } = fakeWindow()
    const el = hero()
    const stop = pinHero(el, win)

    stop()
    scroll(1060)
    resize(800, 500)

    expect(raw.requestAnimationFrame).not.toHaveBeenCalled()
    expect(el.style).toEqual(heroStyle(0))
  })
})
