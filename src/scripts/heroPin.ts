import { HERO_PEEK } from '@/scripts/peek'
import { frameTime, power3Out } from '@/scripts/tween'

/** Scroll distance over which the hero shrinks away, as a fraction of the viewport. */
const RANGE = 0.92

/** How long the hero takes to catch up with the scroll, in ms. */
export const SCRUB_MS = 600

/** Where the hero ends up once the panels cover it. */
const END_SCALE = 0.86
const END_RISE_PERCENT = -6
const END_BLUR_PX = 3

/** A height change below this share of the viewport is a mobile toolbar, not a resize. */
const TOOLBAR_SHARE = 0.25

/** The hero's style at a point of its exit, from 0 at rest to 1 gone. */
export function heroStyle(progress: number) {
  const opacity = 1 - progress
  return {
    transform: `translate(0%, ${END_RISE_PERCENT * progress}%) scale(${1 - (1 - END_SCALE) * progress})`,
    opacity: String(opacity),
    visibility: opacity === 0 ? 'hidden' : 'inherit',
    filter: `blur(${END_BLUR_PX * progress}px)`,
  }
}

/** How far into the exit a scroll position is, measured from the peek offset. */
export function progressAt(scrollY: number, viewport: number): number {
  const start = viewport * HERO_PEEK
  const end = viewport * (HERO_PEEK + RANGE)
  return Math.min(1, Math.max(0, (scrollY - start) / (end - start)))
}

function isTouch(win: Window): boolean {
  return 'ontouchstart' in win.document.documentElement
}

// Shrinks and fades the hero as the panels ride over it. Each scroll eases the shown progress
// toward the new one over SCRUB_MS, which is how GSAP's scrub followed the page before.
export function pinHero(el: HTMLElement, win: Window = window): () => void {
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  let width = win.innerWidth
  let viewport = win.innerHeight
  let shown = progressAt(win.scrollY, viewport)
  let from = shown
  let to = shown
  let startedAt = 0
  let frame = 0

  const apply = () => Object.assign(el.style, heroStyle(shown))

  const tick = (now: number) => {
    const k = Math.min(1, (now - startedAt) / SCRUB_MS)
    shown = from + (to - from) * power3Out(k)
    apply()
    frame = k < 1 ? win.requestAnimationFrame(tick) : 0
  }

  const onScroll = () => {
    from = shown
    to = progressAt(win.scrollY, viewport)
    startedAt = frameTime(win)
    if (frame === 0) frame = win.requestAnimationFrame(tick)
  }

  // A retracting toolbar resizes the viewport, and measuring on that would move the range mid-scroll
  const onResize = () => {
    const toolbar =
      isTouch(win) &&
      win.innerWidth === width &&
      Math.abs(win.innerHeight - viewport) < win.innerHeight * TOOLBAR_SHARE
    if (toolbar) return
    width = win.innerWidth
    viewport = win.innerHeight
    onScroll()
  }

  apply()
  win.addEventListener('scroll', onScroll, { passive: true })
  win.addEventListener('resize', onResize)

  return () => {
    win.removeEventListener('scroll', onScroll)
    win.removeEventListener('resize', onResize)
    win.cancelAnimationFrame(frame)
  }
}
