import { bindSwipe } from '@/scripts/swipe'

/** The classes that mark a pill as the shown screen or as one to pick. */
export const PILL_ACTIVE = ['bg-dawn-cream/10', 'text-dawn-accent']
export const PILL_IDLE = ['hover:text-dawn-cream', 'text-dawn-taupe']

// Screens are stacked and swapped by opacity, which keeps a fetch out of a switch. A pill
// picks one, and a tap or a swipe on the screen steps through them.
export function bindScreens(root: HTMLElement): () => void {
  const pills = [...root.querySelectorAll<HTMLButtonElement>('fieldset button')]
  const shots = [...root.querySelectorAll<HTMLImageElement>('img')]
  const count = shots.length
  let active = 0

  const show = (index: number) => {
    active = index
    pills.forEach((pill, i) => {
      const on = i === index
      pill.setAttribute('aria-pressed', String(on))
      pill.classList.remove(...(on ? PILL_IDLE : PILL_ACTIVE))
      pill.classList.add(...(on ? PILL_ACTIVE : PILL_IDLE))
    })
    shots.forEach((shot, i) => {
      const on = i === index
      shot.setAttribute('aria-hidden', String(!on))
      shot.classList.toggle('opacity-100', on)
      shot.classList.toggle('opacity-0', !on)
    })
  }

  const listeners = pills.map((pill, index) => {
    const pick = () => show(index)
    pill.addEventListener('click', pick)
    return () => pill.removeEventListener('click', pick)
  })

  const next = () => show((active + 1) % count)
  const previous = () => show((active - 1 + count) % count)
  const screen = root.querySelector<HTMLElement>('[data-screen-next]')!
  const unbind = bindSwipe(screen, { onTap: next, onSwipeLeft: next, onSwipeRight: previous })

  return () => {
    for (const remove of listeners) remove()
    unbind()
  }
}
