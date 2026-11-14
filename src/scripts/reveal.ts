import { tween } from '@/scripts/tween'

/** How far up the viewport a top has to rise, as a fraction, when `data-threshold` is absent. */
const DEFAULT_THRESHOLD = 0.1

/** How far an entrance rises into place, in px, and how long it takes, in ms. */
export const REVEAL_DISTANCE = 20
export const REVEAL_DURATION = 800

const SECOND = 1000

function line(el: HTMLElement, viewport: number): number {
  return viewport * (1 - Number(el.dataset.threshold ?? DEFAULT_THRESHOLD))
}

function play(el: HTMLElement) {
  tween({
    duration: REVEAL_DURATION,
    delay: Number(el.dataset.delay ?? 0) * SECOND,
    onUpdate: (progress) => {
      el.style.opacity = String(progress)
      el.style.transform = `translate(0px, ${REVEAL_DISTANCE * (1 - progress)}px)`
    },
  })
}

// Plays each `.reveal` once its top crosses its line, a jump past it included. It checks in the
// scroll event itself, as ScrollTrigger did, since a frame's wait showed as a late start.
export function startReveals(root: ParentNode = document): () => void {
  const pending = new Set(root.querySelectorAll<HTMLElement>('.reveal'))

  const stop = () => {
    removeEventListener('scroll', check)
    removeEventListener('resize', check)
  }

  function check() {
    for (const el of pending) {
      if (el.getBoundingClientRect().top > line(el, innerHeight)) continue
      pending.delete(el)
      play(el)
    }
    if (pending.size === 0) stop()
  }

  addEventListener('scroll', check, { passive: true })
  addEventListener('resize', check)
  check()

  return stop
}
