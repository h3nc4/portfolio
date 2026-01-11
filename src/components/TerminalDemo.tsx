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

import { Terminal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface TerminalStep {
  text?: string
  component?: React.ReactNode
  type: 'command' | 'output' | 'custom'
  delay?: number
}

interface TerminalDemoProps {
  /** Script of commands and outputs to simulate */
  readonly script: TerminalStep[]
  /** Additional class names for the terminal container */
  readonly className?: string
  /** Delay in ms before the script starts playing */
  readonly startDelay?: number
  /** Delay in ms before restarting the script after completion */
  readonly restartDelay?: number
  /** Minimum delay in ms between keystrokes */
  readonly minTypingDelay?: number
  /** Maximum delay in ms between keystrokes */
  readonly maxTypingDelay?: number
}

interface RenderedLine {
  id: number
  text?: string
  component?: React.ReactNode
  type: 'command' | 'output' | 'custom'
}

interface SimulationState {
  setLines: React.Dispatch<React.SetStateAction<RenderedLine[]>>
  setCurrentCommand: React.Dispatch<React.SetStateAction<string>>
  setShowPrompt: React.Dispatch<React.SetStateAction<boolean>>
}

const DEFAULT_START_DELAY = 1000
const DEFAULT_RESTART_DELAY = 4000
const DEFAULT_MIN_TYPING_DELAY = 30
const DEFAULT_MAX_TYPING_DELAY = 70
const COMMAND_EXECUTION_DELAY = 300

/**
 * Generates a random delay for typing effect jitter.
 * Safe to use pseudo-random generator here as it is only for visual animation.
 */
function getRandomDelay(min: number, max: number) {
  // eslint-disable-next-line sonarjs/pseudo-random
  return min + Math.random() * (max - min)
}

/**
 * Standard wait function that supports cancellation via AbortSignal.
 */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }

    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/**
 * Simulates typing a command character by character.
 */
async function typeCommand(
  text: string,
  minDelay: number,
  maxDelay: number,
  onType: (text: string) => void,
  signal: AbortSignal,
) {
  for (let i = 0; i <= text.length; i++) {
    // Check early to avoid setting state if aborted during microtask
    if (signal.aborted) return
    onType(text.slice(0, i))
    const delay = getRandomDelay(minDelay, maxDelay)
    await wait(delay, signal)
  }
}

/**
 * Executes a single step of the terminal script (command or output).
 */
async function runScriptStep(
  step: TerminalStep,
  params: {
    minTypingDelay: number
    maxTypingDelay: number
    state: SimulationState
    signal: AbortSignal
  },
) {
  const { state, signal, minTypingDelay, maxTypingDelay } = params

  if (step.delay) {
    await wait(step.delay, signal)
  }

  // Access text property here to ensure any getter errors are caught by the loop's try/catch
  // rather than crashing React's render cycle inside the setLines callback.
  const text = step.text ?? ''

  if (step.type === 'command') {
    state.setShowPrompt(true)
    await typeCommand(text, minTypingDelay, maxTypingDelay, state.setCurrentCommand, signal)
    await wait(COMMAND_EXECUTION_DELAY, signal)

    state.setLines((prev) => [...prev, { id: Date.now(), text, type: 'command' }])
    state.setCurrentCommand('')
    state.setShowPrompt(false)
  } else if (step.type === 'custom') {
    state.setLines((prev) => [
      ...prev,
      { id: Date.now(), component: step.component, type: 'custom' },
    ])
  } else {
    state.setLines((prev) => [...prev, { id: Date.now(), text, type: 'output' }])
  }
}

/**
 * Runs a full cycle of the script: reset -> start delay -> steps -> restart delay.
 */
async function runSimulationCycle(
  props: TerminalDemoProps,
  state: SimulationState,
  signal: AbortSignal,
) {
  const {
    script,
    startDelay = DEFAULT_START_DELAY,
    restartDelay = DEFAULT_RESTART_DELAY,
    minTypingDelay = DEFAULT_MIN_TYPING_DELAY,
    maxTypingDelay = DEFAULT_MAX_TYPING_DELAY,
  } = props

  state.setLines([])
  state.setCurrentCommand('')
  state.setShowPrompt(true)

  if (startDelay > 0) {
    await wait(startDelay, signal)
  }

  for (const step of script) {
    await runScriptStep(step, {
      minTypingDelay,
      maxTypingDelay,
      state,
      signal,
    })
  }

  state.setShowPrompt(true)

  if (restartDelay > 0) {
    await wait(restartDelay, signal)
  }
}

/**
 * Renders a terminal line based on its type.
 */
function renderTerminalLine(line: RenderedLine) {
  if (line.type === 'command') {
    return (
      <div className="flex gap-2">
        <span className="shrink-0 font-bold text-green-400">me@pc $</span>
        <span className="whitespace-pre-wrap text-zinc-100">{line.text}</span>
      </div>
    )
  }

  if (line.type === 'custom') {
    return <div className="my-2">{line.component}</div>
  }

  return <div className="whitespace-pre-wrap text-zinc-400">{line.text}</div>
}

/**
 * Simulates a terminal window executing a script.
 * Replaces the need for GIFs by rendering code execution dynamically.
 */
export function TerminalDemo(props: TerminalDemoProps) {
  const {
    script,
    className,
    startDelay = DEFAULT_START_DELAY,
    restartDelay = DEFAULT_RESTART_DELAY,
    minTypingDelay = DEFAULT_MIN_TYPING_DELAY,
    maxTypingDelay = DEFAULT_MAX_TYPING_DELAY,
  } = props

  const [lines, setLines] = useState<RenderedLine[]>([])
  const [currentCommand, setCurrentCommand] = useState('')
  const [showPrompt, setShowPrompt] = useState(true)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on content change
  useEffect(() => {
    const el = bodyRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [lines, currentCommand, showPrompt])

  // Main simulation loop
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const loop = async () => {
      try {
        while (!signal.aborted) {
          await runSimulationCycle(props, { setLines, setCurrentCommand, setShowPrompt }, signal)
        }
      } catch (err) {
        // Ignore AbortError on cleanup, rethrow unexpected errors
        if (err instanceof DOMException && err.name === 'AbortError') return
        if (err instanceof Error && err.name === 'AbortError') return
        console.error('Terminal simulation error:', err)
      }
    }

    void loop()

    return () => {
      controller.abort()
    }
  }, [script, startDelay, restartDelay, minTypingDelay, maxTypingDelay, props])

  return (
    <div
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/90 font-mono text-xs shadow-xl',
        className,
      )}
      data-testid="terminal-window"
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/20" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/20" />
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500">
          <Terminal className="h-3 w-3" />
          <span>bash</span>
        </div>
        <div className="w-12" /> {/* Spacer for centering */}
      </div>

      {/* Terminal Body */}
      <div
        ref={bodyRef}
        className="scrollbar-hide flex h-48 flex-col space-y-1 overflow-y-auto p-3 md:h-56"
      >
        {lines.map((line) => (
          <div key={line.id} className="break-all">
            {renderTerminalLine(line)}
          </div>
        ))}

        {/* Active Prompt */}
        {showPrompt && (
          <div className="flex gap-2" data-testid="active-prompt">
            <span className="shrink-0 font-bold text-green-400">me@pc $</span>
            <span className="whitespace-pre-wrap text-zinc-100">
              {currentCommand}
              <span
                data-testid="cursor"
                className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-zinc-400 align-middle"
              />
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
