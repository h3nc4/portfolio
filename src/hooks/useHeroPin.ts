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

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { type RefObject, useEffect } from 'react'

import { HERO_PEEK } from '@/hooks/useHeroPeek'

gsap.registerPlugin(ScrollTrigger)

/** How far past the peek the shrink runs, as a fraction of the viewport. */
const RANGE = 0.92

/** Seconds the shrink takes to catch up to the scroll position. */
const SCRUB = 0.6

/**
 * Shrinks the hero out of sight while the panels ride up over it. The range
 * starts at the peek offset, since a range starting at zero would leave the
 * hero part way out on first paint.
 *
 * autoAlpha rather than opacity: it hides the element outright at zero, so the
 * hero neither shows through the gaps between panels nor takes a tab stop
 * while it is covered.
 */
export function useHeroPin(target: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = target.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const tween = gsap.to(el, {
      scale: 0.86,
      yPercent: -6,
      autoAlpha: 0,
      filter: 'blur(3px)',
      ease: 'none',
      scrollTrigger: {
        start: () => window.innerHeight * HERO_PEEK,
        end: () => window.innerHeight * (HERO_PEEK + RANGE),
        scrub: SCRUB,
        invalidateOnRefresh: true,
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [target])
}
