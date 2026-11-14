// @vitest-environment node
import { within } from '@testing-library/dom'

import TerminalDemo from '@/components/TerminalDemo.astro'
import type { TerminalStep } from '@/lib/terminal'
import { render } from '@/test/astro'

const SCRIPT: TerminalStep[] = [
  { type: 'command', text: 'echo hi' },
  { type: 'output', text: 'hi', delay: 100 },
]

async function terminal(script: TerminalStep[], props: Record<string, unknown> = {}) {
  return render(TerminalDemo, { props: { script, ...props } })
}

describe('TerminalDemo', () => {
  it('renders the window with a bare prompt and a cursor', async () => {
    const body = await terminal([])

    expect(within(body).getByTestId('terminal-window')).toHaveAttribute('data-terminal')
    expect(within(body).getByTestId('active-prompt')).toHaveTextContent('me@pc $')
    expect(within(body).getByTestId('cursor')).toBeInTheDocument()
    expect(within(body).getByText('bash')).toBeInTheDocument()
  })

  it('carries its script for the player to read', async () => {
    const shell = within(await terminal(SCRIPT)).getByTestId('terminal-window')

    expect(JSON.parse(shell.dataset.script!)).toEqual(SCRIPT)
  })

  it('types nothing into the markup, leaving the script to the player', async () => {
    const body = await terminal(SCRIPT)

    expect(within(body).queryByText(/echo hi/)).not.toBeInTheDocument()
  })

  it('marks the body the player writes into', async () => {
    const shell = within(await terminal(SCRIPT)).getByTestId('terminal-window')

    expect(shell.querySelector('[data-terminal-body]')).toContainElement(
      within(shell).getByTestId('active-prompt'),
    )
  })

  it('applies a custom class to the window', async () => {
    const body = await terminal([], { class: 'custom-class' })

    expect(within(body).getByTestId('terminal-window')).toHaveClass('custom-class')
  })

  it('ships no media template for a script that shows none', async () => {
    const shell = within(await terminal(SCRIPT)).getByTestId('terminal-window')

    expect(shell.querySelector('template')).toBeNull()
  })

  it('ships the rick roll as an inert template for a script that plays it', async () => {
    const shell = within(
      await terminal([...SCRIPT, { type: 'custom', media: 'rick-roll' }]),
    ).getByTestId('terminal-window')
    const template = shell.querySelector<HTMLTemplateElement>('template[data-media="rick-roll"]')!

    expect(
      template.content.querySelector('[data-testid="rick-roll-container"] video'),
    ).not.toBeNull()
    expect(shell.querySelector('video')).toBeNull()
  })
})
