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

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TerminalStep } from '@/lib/terminal'

import { createTerminalView, startTerminal } from './terminal'

const PROMPT_LABEL = '<span class="text-term-prompt shrink-0 font-medium">me@pc $</span>'
const CURSOR =
  '<span data-testid="cursor" class="bg-dawn-cream ml-1 inline-block h-3 w-1.5 animate-pulse align-middle"></span>'

// The window `TerminalDemo.astro` renders, a body holding one active prompt with a cursor.
function terminalHtml(script?: TerminalStep[], media = '') {
  const data = script ? ` data-script='${JSON.stringify(script)}'` : ''
  return `<div data-terminal${data}><div data-terminal-body><div class="flex gap-2" data-testid="active-prompt">${PROMPT_LABEL}<span class="text-dawn-sand whitespace-pre-wrap">${CURSOR}</span></div></div>${media}</div>`
}

function mount(script?: TerminalStep[], media = '') {
  document.body.innerHTML = terminalHtml(script, media)
  const terminal = document.querySelector<HTMLElement>('[data-terminal]')!
  const body = terminal.querySelector<HTMLElement>('[data-terminal-body]')!
  return { terminal, body }
}

const prompt = () => document.querySelector<HTMLElement>('[data-testid="active-prompt"]')
// Exact, as toHaveTextContent matches a substring.
const promptText = () => prompt()?.textContent
const rows = (body: HTMLElement) => [...body.children].filter((el) => el !== prompt())
const flush = () => Promise.resolve()

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createTerminalView', () => {
  it('draws nothing until the task ends', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'output', text: 'later' })
    expect(body).not.toHaveTextContent('later')

    await flush()
    expect(body).toHaveTextContent('later')
  })

  it('draws a command line with the prompt label, ahead of the active prompt', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'command', text: 'ls -la' })
    await flush()

    expect(body.firstElementChild!.outerHTML).toBe(
      `<div class="break-all"><div class="flex gap-2">${PROMPT_LABEL}<span class="text-dawn-sand whitespace-pre-wrap">ls -la</span></div></div>`,
    )
    expect(body.lastElementChild).toBe(prompt())
  })

  it('draws an output line', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'output', text: 'Output Line' })
    await flush()

    expect(rows(body).map((row) => row.outerHTML)).toEqual([
      '<div class="break-all"><div class="text-dawn-taupe whitespace-pre-wrap">Output Line</div></div>',
    ])
  })

  it('draws an empty line for a step with no text', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'output' })
    await flush()

    expect(rows(body).map((row) => row.outerHTML)).toEqual([
      '<div class="break-all"><div class="text-dawn-taupe whitespace-pre-wrap"></div></div>',
    ])
  })

  it('keeps lines in the order they were added', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'output', text: 'one' })
    await flush()
    view.addLine({ type: 'output', text: 'two' })
    view.addLine({ type: 'output', text: 'three' })
    await flush()

    expect(rows(body).map((row) => row.textContent)).toEqual(['one', 'two', 'three'])
  })

  it('clones the media template for a custom line', async () => {
    const { body, terminal } = mount(
      undefined,
      '<template data-media="rick-roll"><div data-testid="custom-element">Custom</div></template>',
    )
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'custom', media: 'rick-roll' })
    view.addLine({ type: 'custom', media: 'rick-roll' })
    await flush()

    const clones = body.querySelectorAll('[data-testid="custom-element"]')
    expect(clones).toHaveLength(2)
    expect(rows(body)[0]!.outerHTML).toBe(
      '<div class="break-all"><div class="my-2"><div data-testid="custom-element">Custom</div></div></div>',
    )
    expect(terminal.querySelector('template')!.content.childElementCount).toBe(1)
  })

  it('leaves a custom line empty when its template is missing', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'custom', media: 'rick-roll' })
    await flush()

    expect(rows(body).map((row) => row.outerHTML)).toEqual([
      '<div class="break-all"><div class="my-2"></div></div>',
    ])
  })

  it('types the command into a text node ahead of the server rendered cursor', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)
    const input = prompt()!.lastElementChild!

    view.setCommand('ec')
    await flush()
    const text = input.firstChild
    expect(text).toBeInstanceOf(Text)
    expect(input.innerHTML).toBe(`ec${CURSOR}`)

    view.setCommand('echo')
    await flush()
    expect(input.firstChild).toBe(text)
    expect(input.innerHTML).toBe(`echo${CURSOR}`)
  })

  it('removes the prompt when hidden and builds a new one with a cursor when shown', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)
    const first = prompt()

    view.setPrompt(false)
    await flush()
    expect(prompt()).toBeNull()

    view.setCommand('typed')
    await flush()
    expect(prompt()).toBeNull()

    view.setPrompt(true)
    await flush()
    expect(prompt()).not.toBe(first)
    const expected = document.createElement('template')
    expected.innerHTML = `<div class="flex gap-2" data-testid="active-prompt">${PROMPT_LABEL}<span class="text-dawn-sand whitespace-pre-wrap">typed${CURSOR}</span></div>`
    expect(prompt()!.isEqualNode(expected.content.firstChild)).toBe(true)
    expect(body.lastElementChild).toBe(prompt())
  })

  it('keeps the same prompt when it is hidden and shown again in one task', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)
    const first = prompt()

    view.setPrompt(false)
    view.setPrompt(true)
    await flush()

    expect(prompt()).toBe(first)
  })

  it('adds lines after the last one while the prompt is hidden, and the prompt after them', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)

    view.addLine({ type: 'command', text: 'cmd' })
    view.setPrompt(false)
    await flush()
    view.addLine({ type: 'output', text: 'output' })
    await flush()
    view.setPrompt(true)
    await flush()

    expect([...body.children].map((el) => el.textContent)).toEqual([
      'me@pc $cmd',
      'output',
      'me@pc $',
    ])
  })

  it('resets to a bare prompt', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)
    view.addLine({ type: 'output', text: 'gone' })
    view.setCommand('half')
    view.setPrompt(false)
    await flush()

    view.reset()
    await flush()

    expect(body.children).toHaveLength(1)
    expect(promptText()).toBe('me@pc $')
    expect(prompt()!.querySelector('[data-testid="cursor"]')).not.toBeNull()
  })

  it('clears every drawn line when as many are added back in the same task', async () => {
    const { body, terminal } = mount()
    const view = createTerminalView(body, terminal)
    view.addLine({ type: 'output', text: 'old' })
    await flush()

    view.reset()
    view.addLine({ type: 'output', text: 'new' })
    await flush()

    expect(rows(body).map((row) => row.textContent)).toEqual(['new'])
  })

  it('scrolls the body to the bottom after each draw', async () => {
    const { body, terminal } = mount()
    Object.defineProperty(body, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(body, 'scrollTop', { value: 0, writable: true, configurable: true })
    const view = createTerminalView(body, terminal)

    view.setCommand('c')
    await flush()
    expect(body.scrollTop).toBe(500)

    body.scrollTop = 0
    view.addLine({ type: 'output', text: 'more' })
    await flush()
    expect(body.scrollTop).toBe(500)
  })
})

describe('startTerminal', () => {
  const script: TerminalStep[] = [
    { type: 'command', text: 'whoami' },
    { type: 'output', text: 'root' },
  ]
  let report: (ratio: number) => void
  let disconnect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    vi.spyOn(console, 'error')
    disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        readonly observe = vi.fn()
        readonly disconnect = disconnect

        constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
          report = (ratio) => {
            callback([{ intersectionRatio: ratio } as IntersectionObserverEntry])
          }
        }
      },
    )
  })

  afterEach(() => {
    expect(console.error).not.toHaveBeenCalled()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  // With the default timing and a 50 ms keystroke, `whoami` is typed by 1300 and committed at 1650.
  const bare = (body: HTMLElement) => {
    expect(body.children).toHaveLength(1)
    expect(promptText()).toBe('me@pc $')
  }

  it('types nothing until the terminal reaches the screen', async () => {
    const { terminal, body } = mount(script)
    startTerminal(terminal)

    await vi.advanceTimersByTimeAsync(5000)

    bare(body)
  })

  it('plays the script from the first keystroke once on screen', async () => {
    const { terminal, body } = mount(script)
    startTerminal(terminal)
    await vi.advanceTimersByTimeAsync(5000)

    report(0.5)
    await vi.advanceTimersByTimeAsync(1050)
    expect(promptText()).toBe('me@pc $w')

    await vi.advanceTimersByTimeAsync(600)
    expect([...body.children].map((el) => el.textContent)).toEqual([
      'me@pc $whoami',
      'root',
      'me@pc $',
    ])
  })

  it('goes back to a bare prompt and stops when it leaves the screen', async () => {
    const { terminal, body } = mount(script)
    startTerminal(terminal)
    report(1)
    await vi.advanceTimersByTimeAsync(1650)

    report(0)
    await flush()
    bare(body)

    await vi.advanceTimersByTimeAsync(10_000)
    bare(body)
  })

  it('restarts from the top when it comes back', async () => {
    const { terminal, body } = mount(script)
    startTerminal(terminal)
    report(1)
    await vi.advanceTimersByTimeAsync(1200)
    report(0)
    await flush()

    report(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(promptText()).toBe('me@pc $')
    await vi.advanceTimersByTimeAsync(50)
    expect(promptText()).toBe('me@pc $w')
    expect(body.children).toHaveLength(1)
  })

  it('stops watching and playing once its return is called', async () => {
    const { terminal, body } = mount(script)
    const stop = startTerminal(terminal)
    report(1)
    await vi.advanceTimersByTimeAsync(1100)
    const shown = body.innerHTML

    stop()
    await vi.advanceTimersByTimeAsync(10_000)

    expect(disconnect).toHaveBeenCalled()
    expect(body.innerHTML).toBe(shown)
  })

  it('can be stopped while off screen', async () => {
    const { terminal, body } = mount(script)
    const stop = startTerminal(terminal)

    stop()
    await vi.advanceTimersByTimeAsync(5000)

    expect(disconnect).toHaveBeenCalled()
    bare(body)
  })

  it('plays a custom step from the media inside the terminal', async () => {
    const { terminal, body } = mount(
      [{ type: 'custom', media: 'rick-roll' }],
      '<template data-media="rick-roll"><p>never gonna</p></template>',
    )
    startTerminal(terminal)
    report(1)

    await vi.advanceTimersByTimeAsync(1000)

    expect(body.querySelector('.my-2')!.innerHTML).toBe('<p>never gonna</p>')
  })

  it('shows a bare prompt without a script', async () => {
    const { terminal, body } = mount()
    startTerminal(terminal)
    report(1)

    await vi.advanceTimersByTimeAsync(10_000)

    bare(body)
  })
})
