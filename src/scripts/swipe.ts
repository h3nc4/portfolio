/** Shortest horizontal travel, in pixels, that counts as a swipe. */
export const SWIPE_MIN_DISTANCE = 40
/** A swipe has to travel this many times further across than down. */
export const SWIPE_HORIZONTAL_RATIO = 2

interface SwipeActions {
  readonly onTap: () => void
  readonly onSwipeLeft: () => void
  readonly onSwipeRight: () => void
}

type Point = Pick<PointerEvent, 'clientX' | 'clientY'>

// Tells a tap from a horizontal swipe. A mostly vertical drag is ignored, so an
// element with `touch-pan-y` still lets the page scroll under a finger.
export function createSwipe({ onTap, onSwipeLeft, onSwipeRight }: SwipeActions) {
  let start: { x: number; y: number } | null = null
  let swiped = false

  return {
    pointerdown(event: Point) {
      start = { x: event.clientX, y: event.clientY }
      swiped = false
    },
    pointerup(event: Point) {
      if (!start) return
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      start = null
      if (Math.abs(dx) < SWIPE_MIN_DISTANCE) return
      if (Math.abs(dx) < SWIPE_HORIZONTAL_RATIO * Math.abs(dy)) return

      swiped = true
      if (dx < 0) onSwipeLeft()
      else onSwipeRight()
    },
    pointercancel() {
      start = null
    },
    // A mouse drag still ends in a click, which must not count as a tap too
    click(event: Pick<MouseEvent, 'detail'>) {
      if (swiped && event.detail > 0) return
      onTap()
    },
  }
}

/** Attaches the swipe handlers to an element, returning the function that detaches them. */
export function bindSwipe(target: HTMLElement, actions: SwipeActions): () => void {
  const handlers = createSwipe(actions)
  const entries = Object.entries(handlers) as [string, (event: Event) => void][]
  for (const [type, handler] of entries) target.addEventListener(type, handler)

  return () => {
    for (const [type, handler] of entries) target.removeEventListener(type, handler)
  }
}
