/** How much of the element has to show before it counts as in view. */
const DEFAULT_ENTER = 0.3

// True at the enter ratio, false only once fully gone, so a scroll on the boundary cannot flap.
// Without an IntersectionObserver it reports true at once, as running early beats never running.
export function watchInView(
  target: Element,
  onChange: (inView: boolean) => void,
  enter: number = DEFAULT_ENTER,
): () => void {
  if (typeof IntersectionObserver === 'undefined') {
    onChange(true)
    return () => {}
  }

  let inView = false
  const report = (next: boolean) => {
    if (next === inView) return
    inView = next
    onChange(next)
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.intersectionRatio >= enter) report(true)
        else if (entry.intersectionRatio === 0) report(false)
      }
    },
    { threshold: [0, enter] },
  )

  observer.observe(target)

  return () => observer.disconnect()
}
