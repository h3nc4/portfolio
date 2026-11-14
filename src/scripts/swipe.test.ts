import { beforeEach, describe, expect, it, vi } from 'vitest'

import { bindSwipe, createSwipe, SWIPE_HORIZONTAL_RATIO, SWIPE_MIN_DISTANCE } from './swipe'

const START = 200
const at = (x: number, y: number) => ({ clientX: x, clientY: y })
const pointerClick = { detail: 1 }
const keyboardClick = { detail: 0 }

const onTap = vi.fn()
const onSwipeLeft = vi.fn()
const onSwipeRight = vi.fn()
const actions = { onTap, onSwipeLeft, onSwipeRight }

function drag(dx: number, dy: number) {
  const swipe = createSwipe(actions)
  swipe.pointerdown(at(START, START))
  swipe.pointerup(at(START + dx, START + dy))
  swipe.click(pointerClick)
}

// A MouseEvent named as a pointer event carries clientX and clientY in jsdom and every browser.
function pointer(type: string, x: number, y: number) {
  return new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
}

describe('createSwipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('reports a press that barely moves as a tap', () => {
    drag(SWIPE_MIN_DISTANCE - 1, 0)

    expect(onTap).toHaveBeenCalledOnce()
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('reports a leftward drag as a swipe left, and swallows its click', () => {
    drag(-SWIPE_MIN_DISTANCE, 0)

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onTap).not.toHaveBeenCalled()
  })

  it('reports a rightward drag as a swipe right', () => {
    drag(SWIPE_MIN_DISTANCE * 2, 10)

    expect(onSwipeRight).toHaveBeenCalledOnce()
    expect(onTap).not.toHaveBeenCalled()
  })

  it('counts a drag exactly twice as far across as down as a swipe', () => {
    const dy = 30
    drag(SWIPE_HORIZONTAL_RATIO * dy, dy)

    expect(onSwipeRight).toHaveBeenCalledOnce()
  })

  it('leaves a mostly vertical drag to the page scroll', () => {
    const dy = 100
    drag(SWIPE_HORIZONTAL_RATIO * dy - 1, dy)

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('ignores a release with no press, and a cancelled press', () => {
    const swipe = createSwipe(actions)
    swipe.pointerup(at(0, 0))
    swipe.pointerdown(at(0, 0))
    swipe.pointercancel()
    swipe.pointerup(at(-START, 0))

    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onSwipeRight).not.toHaveBeenCalled()
  })

  it('still taps from the keyboard right after a swipe', () => {
    const swipe = createSwipe(actions)
    swipe.pointerdown(at(START, START))
    swipe.pointerup(at(0, START))
    swipe.click(keyboardClick)

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onTap).toHaveBeenCalledOnce()
  })

  it('taps again on the next press after a swipe', () => {
    const swipe = createSwipe(actions)
    swipe.pointerdown(at(START, START))
    swipe.pointerup(at(0, START))
    swipe.click(pointerClick)
    swipe.pointerdown(at(START, START))
    swipe.pointerup(at(START, START))
    swipe.click(pointerClick)

    expect(onTap).toHaveBeenCalledOnce()
  })
})

describe('bindSwipe', () => {
  beforeEach(() => vi.clearAllMocks())

  it('drives the swipe from the element events', () => {
    const el = document.createElement('button')
    bindSwipe(el, actions)

    el.dispatchEvent(pointer('pointerdown', START, START))
    el.dispatchEvent(pointer('pointerup', 0, START))
    el.dispatchEvent(new MouseEvent('click', { detail: 1 }))

    expect(onSwipeLeft).toHaveBeenCalledOnce()
    expect(onTap).not.toHaveBeenCalled()
  })

  it('drops a press the pointer cancels', () => {
    const el = document.createElement('button')
    bindSwipe(el, actions)

    el.dispatchEvent(pointer('pointerdown', START, START))
    el.dispatchEvent(pointer('pointercancel', START, START))
    el.dispatchEvent(pointer('pointerup', 0, START))

    expect(onSwipeLeft).not.toHaveBeenCalled()
  })

  it('attaches the four handlers and detaches them again', () => {
    const el = document.createElement('button')
    const add = vi.spyOn(el, 'addEventListener')
    const remove = vi.spyOn(el, 'removeEventListener')
    const types = ['pointerdown', 'pointerup', 'pointercancel', 'click']

    const unbind = bindSwipe(el, actions)
    expect(add.mock.calls.map(([type]) => type)).toEqual(types)

    unbind()
    expect(remove.mock.calls).toEqual(add.mock.calls)

    el.dispatchEvent(pointer('pointerdown', START, START))
    el.dispatchEvent(pointer('pointerup', 0, START))
    el.dispatchEvent(new MouseEvent('click', { detail: 0 }))
    expect(onSwipeLeft).not.toHaveBeenCalled()
    expect(onTap).not.toHaveBeenCalled()
  })
})
