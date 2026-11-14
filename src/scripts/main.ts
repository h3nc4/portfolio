import { pinHero } from '@/scripts/heroPin'
import { peekHero } from '@/scripts/peek'
import { startReveals } from '@/scripts/reveal'
import { bindScreens } from '@/scripts/screens'
import { retargetSiblings } from '@/scripts/siblings'
import { startTerminal } from '@/scripts/terminal'

// Entrances and the pin measure the page at rest, so both start before the peek scrolls it
startReveals()
pinHero(document.querySelector<HTMLElement>('.hero-body')!)
peekHero()

for (const root of document.querySelectorAll<HTMLElement>('[data-screens]')) bindScreens(root)
for (const terminal of document.querySelectorAll<HTMLElement>('[data-terminal]')) {
  startTerminal(terminal)
}
retargetSiblings()
