export type Ease = (t: number) => number

/** GSAP's power3.out, which despite the name is a quartic. */
export const power3Out: Ease = (t) => 1 - (1 - t) ** 4

/** One frame at 60Hz, in ms. */
const TICK_MS = 1000 / 60

// GSAP counted a tween from its last tick, a frame before the event that started it, so its
// first frame drawn was already one frame in. Counting from there keeps that phase.
export function frameTime(win: Window = window): number {
  return Number(win.document.timeline?.currentTime ?? win.performance.now()) - TICK_MS
}

interface Tween {
  /** Length in ms, after the delay. */
  readonly duration: number
  readonly delay?: number
  readonly ease?: Ease
  /** Called once a frame with the eased progress, from just above 0 up to exactly 1. */
  readonly onUpdate: (progress: number) => void
  readonly win?: Window
}

// Styles are written from the main thread each frame, as GSAP wrote them. A CSS transition
// waited on its layer's raster and started up to 70ms late on the wide page.
export function tween({ duration, delay = 0, ease = power3Out, onUpdate, win = window }: Tween) {
  const start = frameTime(win) + delay
  let frame = 0

  const tick = (now: number) => {
    const elapsed = now - start
    if (elapsed >= 0) onUpdate(ease(Math.min(1, elapsed / duration)))
    frame = elapsed < duration ? win.requestAnimationFrame(tick) : 0
  }

  frame = win.requestAnimationFrame(tick)

  return () => win.cancelAnimationFrame(frame)
}
