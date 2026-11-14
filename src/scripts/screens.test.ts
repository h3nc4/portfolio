import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { bindScreens, PILL_ACTIVE, PILL_IDLE } from './screens'

const SCREEN_NAMES = ['Home', 'Gestures', 'Setup']
const START = 200

// The markup HyperGesturePreview.astro renders, with the first screen shown.
function fixture() {
  const root = document.createElement('div')
  root.innerHTML = `
    <fieldset>
      ${SCREEN_NAMES.map(
        (name, i) =>
          `<button type="button" aria-pressed="${i === 0}" class="${(i === 0 ? PILL_ACTIVE : PILL_IDLE).join(' ')}">${name}</button>`,
      ).join('')}
    </fieldset>
    ${SCREEN_NAMES.map(
      (name, i) =>
        `<img alt="${name}" aria-hidden="${i !== 0}" class="${i === 0 ? 'opacity-100' : 'opacity-0'}">`,
    ).join('')}
    <button type="button" data-screen-next></button>
  `
  document.body.append(root)
  return {
    root,
    pills: [...root.querySelectorAll('fieldset button')] as HTMLButtonElement[],
    phone: root.querySelector<HTMLButtonElement>('[data-screen-next]')!,
  }
}

function shown(root: HTMLElement) {
  return [...root.querySelectorAll('img[aria-hidden="false"]')].map((img) =>
    img.getAttribute('alt'),
  )
}

function click(el: HTMLElement, detail = 1) {
  el.dispatchEvent(new MouseEvent('click', { detail, bubbles: true }))
}

function swipe(el: HTMLElement, dx: number) {
  el.dispatchEvent(new MouseEvent('pointerdown', { clientX: START, clientY: START }))
  el.dispatchEvent(new MouseEvent('pointerup', { clientX: START + dx, clientY: START }))
  click(el)
}

describe('bindScreens', () => {
  let view: ReturnType<typeof fixture>
  let unbind: () => void

  beforeEach(() => {
    view = fixture()
    unbind = bindScreens(view.root)
  })

  afterEach(() => {
    unbind()
    view.root.remove()
  })

  it('shows the screen whose pill is clicked', () => {
    click(view.pills[1])

    expect(shown(view.root)).toEqual(['Gestures'])
    expect(view.pills.map((pill) => pill.getAttribute('aria-pressed'))).toEqual([
      'false',
      'true',
      'false',
    ])
  })

  it('swaps the pill classes onto the shown one', () => {
    click(view.pills[2])

    expect(view.pills[2]).toHaveClass(...PILL_ACTIVE)
    expect(view.pills[2]).not.toHaveClass(...PILL_IDLE)
    for (const pill of view.pills.slice(0, 2)) {
      expect(pill).toHaveClass(...PILL_IDLE)
      expect(pill).not.toHaveClass(...PILL_ACTIVE)
    }
  })

  it('fades in the shown image and out the rest', () => {
    click(view.pills[1])
    const images = [...view.root.querySelectorAll('img')]

    expect(images.map((img) => img.classList.contains('opacity-100'))).toEqual([false, true, false])
    expect(images.map((img) => img.classList.contains('opacity-0'))).toEqual([true, false, true])
  })

  it('steps forward on a tap of the screen and wraps after the last', () => {
    click(view.phone)
    expect(shown(view.root)).toEqual(['Gestures'])

    click(view.phone)
    click(view.phone)
    expect(shown(view.root)).toEqual(['Home'])
  })

  it('steps forward from the keyboard on the screen', () => {
    click(view.phone, 0)
    expect(shown(view.root)).toEqual(['Gestures'])
  })

  it('steps forward on a swipe left', () => {
    swipe(view.phone, -START)
    expect(shown(view.root)).toEqual(['Gestures'])
  })

  it('goes back on a swipe right, wrapping to the last screen', () => {
    swipe(view.phone, START)
    expect(shown(view.root)).toEqual(['Setup'])
  })

  it('steps from the screen a pill picked', () => {
    click(view.pills[2])
    click(view.phone)
    expect(shown(view.root)).toEqual(['Home'])
  })

  it('removes every listener when unbound', () => {
    const removes = [...view.pills, view.phone].map((el) => vi.spyOn(el, 'removeEventListener'))

    unbind()
    click(view.pills[1])
    click(view.phone)

    expect(shown(view.root)).toEqual(['Home'])
    for (const remove of removes) expect(remove).toHaveBeenCalled()
  })
})
