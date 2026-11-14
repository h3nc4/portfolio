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

import { DEFAULT_TIMING, playLoop, type TerminalStep, type TerminalView } from '@/lib/terminal'
import { watchInView } from '@/scripts/inView'

const PROMPT = 'me@pc $'

function element(tag: string, className: string, text?: string): HTMLElement {
  const el = document.createElement(tag)
  el.className = className
  if (text) el.textContent = text
  return el
}

function promptLabel(): HTMLElement {
  return element('span', 'text-term-prompt shrink-0 font-medium', PROMPT)
}

function renderLine(line: Omit<TerminalStep, 'delay'>, media: ParentNode): HTMLElement {
  const row = element('div', 'break-all')

  if (line.type === 'command') {
    const body = element('div', 'flex gap-2')
    body.append(promptLabel(), element('span', 'text-dawn-sand whitespace-pre-wrap', line.text))
    row.append(body)
  } else if (line.type === 'custom') {
    const body = element('div', 'my-2')
    const template = media.querySelector<HTMLTemplateElement>(
      `template[data-media="${line.media}"]`,
    )
    if (template) body.append(template.content.cloneNode(true))
    row.append(body)
  } else {
    row.append(element('div', 'text-dawn-taupe whitespace-pre-wrap', line.text))
  }

  return row
}

/** The text node the command types into, ahead of the cursor in the prompt's input span. */
function typed(prompt: HTMLElement): Text {
  const input = prompt.lastElementChild!
  if (input.firstChild instanceof Text) return input.firstChild
  const text = document.createTextNode('')
  input.prepend(text)
  return text
}

// Changes made in one task paint together, so a prompt hidden and shown again in one step
// stays the same element and its cursor keeps its pulse.
export function createTerminalView(body: HTMLElement, media: ParentNode): TerminalView {
  let lines: Omit<TerminalStep, 'delay'>[] = []
  let drawn: HTMLElement[] = []
  let command = ''
  let prompt = true
  let promptEl: HTMLElement | null = body.querySelector('[data-testid="active-prompt"]')
  let cleared = false
  let queued = false

  const draw = () => {
    queued = false

    if (cleared) {
      for (const row of drawn) row.remove()
      drawn = []
      cleared = false
    }
    for (const line of lines.slice(drawn.length)) {
      const row = renderLine(line, media)
      body.insertBefore(row, promptEl)
      drawn.push(row)
    }

    if (prompt && !promptEl) {
      promptEl = element('div', 'flex gap-2')
      promptEl.dataset.testid = 'active-prompt'
      const input = element('span', 'text-dawn-sand whitespace-pre-wrap')
      const cursor = element(
        'span',
        'bg-dawn-cream ml-1 inline-block h-3 w-1.5 animate-pulse align-middle',
      )
      cursor.dataset.testid = 'cursor'
      input.append(cursor)
      promptEl.append(promptLabel(), input)
      body.append(promptEl)
    } else if (!prompt && promptEl) {
      promptEl.remove()
      promptEl = null
    }
    if (promptEl) typed(promptEl).textContent = command

    body.scrollTop = body.scrollHeight
  }

  const queue = () => {
    if (queued) return
    queued = true
    queueMicrotask(draw)
  }

  return {
    reset() {
      cleared = true
      lines = []
      command = ''
      prompt = true
      queue()
    },
    setCommand(text) {
      command = text
      queue()
    },
    setPrompt(shown) {
      prompt = shown
      queue()
    },
    addLine(line) {
      lines = [...lines, line]
      queue()
    },
  }
}

// Plays `data-script` while on screen and shows a bare prompt off it, so a visitor sees the
// first keystroke rather than a run already part way done.
export function startTerminal(terminal: HTMLElement): () => void {
  const body = terminal.querySelector<HTMLElement>('[data-terminal-body]')!
  const script = JSON.parse(terminal.dataset.script ?? '[]') as TerminalStep[]
  const view = createTerminalView(body, terminal)
  let controller: AbortController | null = null

  const stop = watchInView(terminal, (inView) => {
    controller?.abort()
    controller = null
    if (!inView) {
      view.reset()
      return
    }
    controller = new AbortController()
    void playLoop(script, DEFAULT_TIMING, view, controller.signal)
  })

  return () => {
    stop()
    controller?.abort()
  }
}
