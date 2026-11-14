/** How much of the next section to reveal, as a fraction of the viewport. */
export const HERO_PEEK = 0.14

// The hero fills the viewport and would pass for the whole page, so the first paint scrolls the
// next section into view. A restored position or an anchor already has somewhere to be.
export function peekHero(win: Window = window, peek: number = HERO_PEEK) {
  if (win.location.hash || win.scrollY > 0) return

  win.scrollTo({ top: win.innerHeight * peek, behavior: 'auto' })
}
