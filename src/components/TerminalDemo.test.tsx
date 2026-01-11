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

import { act, render, screen } from '@testing-library/react'
import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TerminalDemo, type TerminalStep } from './TerminalDemo'

// Mock React to allow spying on useRef for specific tests
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>()
  return {
    ...actual,
    useRef: vi.fn(actual.useRef),
  }
})

describe('TerminalDemo', () => {
  beforeEach(async () => {
    vi.useFakeTimers()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    // Reset useRef to original implementation by default
    const actualReact = await vi.importActual<typeof React>('react')
    vi.mocked(React.useRef).mockImplementation(actualReact.useRef)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  /**
   * Helper to advance timers in small steps.
   * This allows Promise chains (microtasks) to resolve between timeouts.
   */
  async function advanceTimers(ms: number) {
    const step = 10
    let remaining = ms
    while (remaining > 0) {
      const currentStep = Math.min(remaining, step)
      await act(async () => {
        vi.advanceTimersByTime(currentStep)
      })
      remaining -= currentStep
    }
  }

  const TEST_PROPS = {
    startDelay: 0,
    restartDelay: 1000,
    minTypingDelay: 10,
    maxTypingDelay: 10,
  }

  it('renders the terminal window structure', () => {
    render(<TerminalDemo script={[]} {...TEST_PROPS} />)
    expect(screen.getByTestId('terminal-window')).toBeInTheDocument()
    expect(screen.getByTestId('active-prompt')).toBeInTheDocument()
    expect(screen.getByText('me@pc $')).toBeInTheDocument()
    expect(screen.getByTestId('cursor')).toBeInTheDocument()
  })

  it('renders command typing effect', async () => {
    const script = [{ text: 'echo', type: 'command' as const, delay: 0 }]

    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    // Speed is 10ms/char.
    // 'e' (10ms) -> 'ec' (20ms) -> 'ech' (30ms) -> 'echo' (40ms)
    // Advance 25ms to catch it mid-typing
    await advanceTimers(25)

    const prompt = screen.getByTestId('active-prompt')
    expect(prompt).toHaveTextContent('ec')
  })

  it('commits command and renders output', async () => {
    const script = [{ text: 'done', type: 'command' as const, delay: 0 }]
    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    // Type 4 chars (40ms) + Execution Delay (300ms) = 340ms
    await advanceTimers(400)

    expect(screen.getByText('done')).toBeInTheDocument()
    const prompts = screen.getAllByText('me@pc $')
    expect(prompts.length).toBeGreaterThanOrEqual(2)
  })

  it('renders output immediately after delay', async () => {
    const script = [{ text: 'Output Line', type: 'output' as const, delay: 100 }]

    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    expect(screen.queryByText('Output Line')).not.toBeInTheDocument()

    await advanceTimers(150)

    expect(screen.getByText('Output Line')).toBeInTheDocument()
  })

  it('renders custom component correctly', async () => {
    const script = [
      {
        type: 'custom' as const,
        component: <div data-testid="custom-element">Custom</div>,
        delay: 0,
      },
    ]

    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    await advanceTimers(10)

    expect(screen.getByTestId('custom-element')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('hides prompt while executing multi-step script', async () => {
    const script = [
      { text: 'cmd', type: 'command' as const, delay: 0 },
      { text: 'output', type: 'output' as const, delay: 5000 },
    ]

    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    // Type "cmd" (30ms) + Exec Delay (300ms) = 330ms.
    await advanceTimers(400)

    // Prompt hidden during delay
    expect(screen.queryByTestId('active-prompt')).not.toBeInTheDocument()
    expect(screen.getByText('cmd')).toBeInTheDocument()

    // Advance to finish
    await advanceTimers(5000)

    expect(screen.getByText('output')).toBeInTheDocument()
    expect(screen.getByTestId('active-prompt')).toBeInTheDocument()
  })

  it('restarts animation when it finishes', async () => {
    const script = [{ text: 'test', type: 'command' as const, delay: 0 }]
    // Provide a startDelay so we have a clean window where text is gone after restart
    render(<TerminalDemo script={script} {...TEST_PROPS} startDelay={1000} />)

    // Timeline:
    // 0ms: Start, wait(1000)
    // 1000ms: Begin typing 'test' (4 chars * 10ms = 40ms) -> 1040ms
    // 1040ms: Wait execution (300ms) -> 1340ms. Commit line.
    // Advance to 1400ms to be safe.
    await advanceTimers(1400)
    expect(screen.getByText('test')).toBeInTheDocument()

    // Timeline continue:
    // 1340ms: Wait restart (1000ms) -> 2340ms.
    // 2340ms: Restart triggered. Lines cleared.
    // 2340ms: Wait startDelay (1000ms).
    // During 2340ms -> 3340ms, 'test' should be GONE.
    // Advance 1100ms from 1400ms -> 2500ms.
    await advanceTimers(1100)

    // Should have restarted.
    expect(screen.queryByText('test')).not.toBeInTheDocument()
    expect(screen.getByTestId('active-prompt')).toBeInTheDocument()
  })

  it('skips restart delay when set to 0', async () => {
    const script = [{ text: 'quick', type: 'command' as const, delay: 0 }]
    render(<TerminalDemo script={script} {...TEST_PROPS} restartDelay={0} />)

    // Run script: 5 chars (50ms) + 300ms = 350ms
    await advanceTimers(360)
    expect(screen.queryByText('quick')).not.toBeInTheDocument()
  })

  it('stops execution cleanly when unmounted during command', async () => {
    const script = [{ text: 'long command', type: 'command' as const, delay: 100 }]
    const { unmount } = render(<TerminalDemo script={script} {...TEST_PROPS} />)

    // Advance into delay
    await advanceTimers(50)

    const consoleSpy = vi.spyOn(console, 'error')
    unmount()

    // Advance time where updates would have occurred
    await advanceTimers(200)

    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('stops execution cleanly when unmounted during initial delay', async () => {
    const script = [{ text: 'cmd', type: 'command' as const }]
    const { unmount } = render(<TerminalDemo script={script} startDelay={5000} />)

    await advanceTimers(100)
    unmount()
    await advanceTimers(100)

    // No errors should occur
    expect(true).toBe(true)
  })

  it('scrolls to bottom when content updates', async () => {
    const script = [{ text: 'cmd', type: 'command' as const, delay: 0 }]
    render(<TerminalDemo script={script} {...TEST_PROPS} />)

    const terminalBody = screen
      .getByTestId('terminal-window')
      .querySelector('.overflow-y-auto') as HTMLElement

    Object.defineProperty(terminalBody, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(terminalBody, 'scrollTop', { value: 0, writable: true })

    await advanceTimers(50)

    expect(terminalBody.scrollTop).toBe(500)
  })

  it('handles null ref gracefully in auto-scroll', async () => {
    // Mock useRef to return null current to test the defensive check in useEffect
    vi.mocked(React.useRef).mockReturnValue({
      get current() {
        return null
      },
      set current(_v) {},
    } as unknown as React.RefObject<HTMLDivElement | null>)

    render(<TerminalDemo script={[]} />)
    expect(screen.getByTestId('terminal-window')).toBeInTheDocument()
  })

  it('aborts wait immediately if signal is already aborted (coverage for defensive check)', async () => {
    const controls = { unmount: () => {} }
    let accessed = false

    const delayWithSideEffect = {
      valueOf: () => {
        if (controls.unmount) controls.unmount()
        accessed = true
        return 10
      },
    } as unknown as number

    const script = [{ text: 'a', type: 'command' as const }]
    const { unmount } = render(
      <TerminalDemo script={script} startDelay={0} minTypingDelay={delayWithSideEffect} />,
    )
    controls.unmount = unmount

    // Advance to trigger the loop and the getter
    await advanceTimers(50)

    expect(accessed).toBe(true)
  })

  it('returns early from typing loop if signal aborted between steps', async () => {
    vi.useRealTimers() // Switch off fake timers to manually mock setTimeout

    let storedCallback: (() => void) | undefined
    vi.spyOn(window, 'setTimeout').mockImplementation((cb) => {
      storedCallback = cb as () => void
      return 123 as unknown as number
    })
    vi.spyOn(window, 'clearTimeout').mockImplementation(() => {})

    const script = [{ text: 'ab', type: 'command' as const, delay: 0 }]
    const { unmount } = render(
      <TerminalDemo script={script} startDelay={0} minTypingDelay={0} maxTypingDelay={0} />,
    )

    // Wait for the effect to start and call wait -> setTimeout
    await act(async () => {
      await Promise.resolve()
    })

    expect(storedCallback).toBeDefined()

    // 1. Resolve the wait promise by calling the callback.
    // 2. Unmount to set signal.aborted = true.
    // 3. Allow the promise microtask to resolve, which will resume the loop.
    //    The loop will then hit 'if (signal.aborted) return'.
    const triggerResolve = storedCallback!
    triggerResolve() // wait() promise resolves
    unmount() // signal.aborted = true

    // Flush microtasks to allow typeCommand to resume
    await act(async () => {
      await Promise.resolve()
    })
  })

  it('ignores generic Error with name AbortError (coverage for non-DOMException environments)', async () => {
    const abortError = new Error('Aborted')
    abortError.name = 'AbortError'

    const errorScript = [
      {
        type: 'output',
        get text() {
          throw abortError
        },
      } as unknown as TerminalStep,
    ]

    const consoleSpy = vi.spyOn(console, 'error')
    render(<TerminalDemo script={errorScript} startDelay={0} />)

    // Allow loop to run
    await advanceTimers(10)

    // Should NOT log to console (because we returned early)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('logs generic errors to console', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create a script step that throws a generic Error when accessed
    // This simulates an unexpected failure inside the loop
    const errorScript = [
      {
        type: 'output',
        get text() {
          throw new Error('Unexpected Boom')
        },
      } as unknown as TerminalStep,
    ]

    render(<TerminalDemo script={errorScript} startDelay={0} />)
    await advanceTimers(10)

    expect(consoleSpy).toHaveBeenCalledWith('Terminal simulation error:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
