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
import { gsap } from 'gsap'
import { type RefObject } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useHeroPin } from './useHeroPin'

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
    to: vi.fn(),
  },
}))

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {},
}))

interface PinVars {
  scale: number
  yPercent: number
  autoAlpha: number
  filter: string
  ease: string
  scrollTrigger: {
    start: () => number
    end: () => number
    scrub: number
    invalidateOnRefresh: boolean
  }
}

function pinVars() {
  return vi.mocked(gsap.to).mock.calls[0][1] as unknown as PinVars
}

function setReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: reduce })),
  )
}

describe('useHeroPin', () => {
  const scrollTrigger = { kill: vi.fn() }
  const tween = { kill: vi.fn(), scrollTrigger }

  function ref() {
    return { current: document.createElement('section') } as RefObject<HTMLElement | null>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(gsap.to).mockReturnValue(tween as unknown as gsap.core.Tween)
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
    setReducedMotion(false)
  })

  it('shrinks the hero', () => {
    renderHook(() => useHeroPin(ref()))

    expect(gsap.to).toHaveBeenCalledTimes(1)
    const vars = pinVars()
    expect(vars.scale).toBe(0.86)
    expect(vars.yPercent).toBe(-6)
    expect(vars.filter).toBe('blur(3px)')
  })

  it('hides the hero outright, so no gap between panels shows it', () => {
    renderHook(() => useHeroPin(ref()))

    // autoAlpha, not opacity: it also sets visibility, which drops the tab stops
    expect(pinVars()).toHaveProperty('autoAlpha', 0)
    expect(pinVars()).not.toHaveProperty('opacity')
  })

  it('scrubs rather than tracking the scrollbar exactly', () => {
    renderHook(() => useHeroPin(ref()))

    const { scrub, invalidateOnRefresh } = pinVars().scrollTrigger
    expect(scrub).toBe(0.6)
    expect(invalidateOnRefresh).toBe(true)
  })

  it('starts where the peek lands, so the hero is whole on first paint', () => {
    renderHook(() => useHeroPin(ref()))

    const { start, end } = pinVars().scrollTrigger
    expect(start()).toBe(140)
    expect(end()).toBe(1060)
  })

  it('reads the viewport afresh, so a resize moves the range', () => {
    renderHook(() => useHeroPin(ref()))
    const { start } = pinVars().scrollTrigger

    Object.defineProperty(window, 'innerHeight', { value: 500, configurable: true })

    expect(start()).toBe(70)
  })

  it('holds the hero still when motion is unwelcome', () => {
    setReducedMotion(true)

    renderHook(() => useHeroPin(ref()))

    expect(gsap.to).not.toHaveBeenCalled()
  })

  it('does nothing before the hero mounts', () => {
    const empty = { current: null } as RefObject<HTMLElement | null>

    renderHook(() => useHeroPin(empty))

    expect(gsap.to).not.toHaveBeenCalled()
  })

  it('takes its trigger with it on unmount', () => {
    const { unmount } = renderHook(() => useHeroPin(ref()))

    unmount()

    expect(scrollTrigger.kill).toHaveBeenCalledTimes(1)
    expect(tween.kill).toHaveBeenCalledTimes(1)
  })

  it('survives a tween that never got a trigger', () => {
    vi.mocked(gsap.to).mockReturnValue({ kill: tween.kill } as unknown as gsap.core.Tween)

    const { unmount } = renderHook(() => useHeroPin(ref()))

    expect(() => unmount()).not.toThrow()
  })
})
