import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  DEFAULT_TIMING,
  playLoop,
  runCycle,
  type TerminalStep,
  type TerminalTiming,
  type TerminalView,
  wait,
} from './terminal'

type Call = [at: number, method: string, ...args: unknown[]]

/** A view that logs every call with the fake clock, so a test reads the whole timeline. */
function recorder(onCall?: (method: string) => void) {
  const start = Date.now()
  const calls: Call[] = []
  const log =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push([Date.now() - start, method, ...args])
      onCall?.(method)
    }
  const view: TerminalView = {
    reset: log('reset'),
    setCommand: log('setCommand'),
    setPrompt: log('setPrompt'),
    addLine: log('addLine'),
  }
  return { calls, view }
}

const FAST: TerminalTiming = {
  startDelay: 0,
  restartDelay: 1000,
  minTypingDelay: 10,
  maxTypingDelay: 10,
}

function abortError() {
  return expect.objectContaining({ name: 'AbortError' })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('DEFAULT_TIMING', () => {
  it('waits a second to start, four to restart, and types every 30 to 70 ms', () => {
    expect(DEFAULT_TIMING).toEqual({
      startDelay: 1000,
      restartDelay: 4000,
      minTypingDelay: 30,
      maxTypingDelay: 70,
    })
  })
})

describe('wait', () => {
  it('resolves once its time is up', async () => {
    const ended = vi.fn()
    void wait(100, new AbortController().signal).then(ended)

    await vi.advanceTimersByTimeAsync(99)
    expect(ended).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(ended).toHaveBeenCalled()
  })

  it('rejects at once when the signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(wait(100, controller.signal)).rejects.toEqual(abortError())
    expect(vi.getTimerCount()).toBe(0)
  })

  it('rejects when the signal aborts later and clears its timer', async () => {
    const controller = new AbortController()
    const waiting = wait(100, controller.signal)
    expect(vi.getTimerCount()).toBe(1)

    controller.abort()

    await expect(waiting).rejects.toBeInstanceOf(DOMException)
    await expect(waiting).rejects.toEqual(abortError())
    expect(vi.getTimerCount()).toBe(0)
  })

  it('stops listening once it resolves', async () => {
    const controller = new AbortController()
    const remove = vi.spyOn(controller.signal, 'removeEventListener')
    const waiting = wait(10, controller.signal)

    await vi.advanceTimersByTimeAsync(10)
    await waiting

    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function))
  })
})

describe('runCycle', () => {
  function cycle(script: TerminalStep[], timing: TerminalTiming = FAST) {
    const { calls, view } = recorder()
    const ended = vi.fn()
    void runCycle(script, timing, view, new AbortController().signal).then(ended)
    return { calls, ended }
  }

  it('types a command one character at a time, then commits it after 300 ms', async () => {
    const { calls, ended } = cycle([{ type: 'command', text: 'echo' }])

    await vi.advanceTimersByTimeAsync(350 + 1000)

    expect(calls).toEqual([
      [0, 'reset'],
      [0, 'setPrompt', true],
      [0, 'setCommand', ''],
      [10, 'setCommand', 'e'],
      [20, 'setCommand', 'ec'],
      [30, 'setCommand', 'ech'],
      [40, 'setCommand', 'echo'],
      [350, 'addLine', { type: 'command', text: 'echo' }],
      [350, 'setCommand', ''],
      [350, 'setPrompt', false],
      [350, 'setPrompt', true],
    ])
    expect(ended).toHaveBeenCalled()
  })

  it('shows the command part way typed', async () => {
    const { calls } = cycle([{ type: 'command', text: 'echo' }])

    await vi.advanceTimersByTimeAsync(25)

    expect(calls.at(-1)).toEqual([20, 'setCommand', 'ec'])
  })

  it('jitters each keystroke between the minimum and maximum delay', async () => {
    const timing = { ...FAST, minTypingDelay: 30, maxTypingDelay: 70 }
    vi.mocked(Math.random).mockReturnValueOnce(0).mockReturnValueOnce(1).mockReturnValueOnce(0.25)

    const { calls } = cycle([{ type: 'command', text: 'ab' }], timing)
    await vi.advanceTimersByTimeAsync(440)

    const typed = calls.filter(([, method]) => method === 'setCommand').slice(0, 3)
    expect(typed).toEqual([
      [0, 'setCommand', ''],
      [30, 'setCommand', 'a'],
      [100, 'setCommand', 'ab'],
    ])
    expect(calls).toContainEqual([140 + 300, 'addLine', { type: 'command', text: 'ab' }])
  })

  it('types an empty command when the step has no text', async () => {
    const { calls } = cycle([{ type: 'command' }])

    await vi.advanceTimersByTimeAsync(10 + 300)

    expect(calls).toContainEqual([310, 'addLine', { type: 'command', text: '' }])
  })

  it('waits the step delay before an output line', async () => {
    const { calls } = cycle([{ type: 'output', text: 'Output Line', delay: 100 }])

    await vi.advanceTimersByTimeAsync(99)
    expect(calls).toEqual([[0, 'reset']])

    await vi.advanceTimersByTimeAsync(1)
    expect(calls).toEqual([
      [0, 'reset'],
      [100, 'addLine', { type: 'output', text: 'Output Line' }],
      [100, 'setPrompt', true],
    ])
  })

  it('adds an output line with empty text when the step has none', async () => {
    const { calls } = cycle([{ type: 'output' }])

    await vi.advanceTimersByTimeAsync(0)

    expect(calls).toContainEqual([0, 'addLine', { type: 'output', text: '' }])
  })

  it('adds a custom line naming its media', async () => {
    const { calls } = cycle([{ type: 'custom', media: 'rick-roll' }])

    await vi.advanceTimersByTimeAsync(0)

    expect(calls).toContainEqual([0, 'addLine', { type: 'custom', media: 'rick-roll' }])
  })

  it('keeps the prompt hidden between a command and a delayed step', async () => {
    const { calls } = cycle([
      { type: 'command', text: 'cmd' },
      { type: 'output', text: 'output', delay: 5000 },
    ])

    await vi.advanceTimersByTimeAsync(400)
    expect(calls.at(-1)).toEqual([340, 'setPrompt', false])

    await vi.advanceTimersByTimeAsync(5000)
    expect(calls.slice(-2)).toEqual([
      [5340, 'addLine', { type: 'output', text: 'output' }],
      [5340, 'setPrompt', true],
    ])
  })

  it('waits the start delay before the first step', async () => {
    const { calls } = cycle([{ type: 'output', text: 'hi' }], { ...FAST, startDelay: 1000 })

    await vi.advanceTimersByTimeAsync(999)
    expect(calls).toEqual([[0, 'reset']])

    await vi.advanceTimersByTimeAsync(1)
    expect(calls).toContainEqual([1000, 'addLine', { type: 'output', text: 'hi' }])
  })

  it('ends after the restart delay', async () => {
    const { ended } = cycle([], FAST)

    await vi.advanceTimersByTimeAsync(999)
    expect(ended).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(ended).toHaveBeenCalled()
  })

  it('ends at once when there is no restart delay', async () => {
    const { calls, ended } = cycle([], { ...FAST, restartDelay: 0 })

    await vi.advanceTimersByTimeAsync(0)

    expect(calls).toEqual([
      [0, 'reset'],
      [0, 'setPrompt', true],
    ])
    expect(ended).toHaveBeenCalled()
  })
})

describe('playLoop', () => {
  it('restarts the script from a reset after the restart delay', async () => {
    const { calls, view } = recorder()
    const controller = new AbortController()
    void playLoop([{ type: 'command', text: 'test' }], FAST, view, controller.signal)

    await vi.advanceTimersByTimeAsync(1349)
    expect(calls.filter(([, method]) => method === 'reset')).toEqual([[0, 'reset']])

    await vi.advanceTimersByTimeAsync(1)
    expect(calls.filter(([, method]) => method === 'reset')).toEqual([
      [0, 'reset'],
      [1350, 'reset'],
    ])
    controller.abort()
  })

  it('ends quietly when the signal aborts during a wait', async () => {
    const error = vi.spyOn(console, 'error')
    const { calls, view } = recorder()
    const controller = new AbortController()
    const ended = vi.fn()
    void playLoop(
      [{ type: 'command', text: 'long', delay: 100 }],
      FAST,
      view,
      controller.signal,
    ).then(ended)

    await vi.advanceTimersByTimeAsync(50)
    controller.abort()
    await vi.advanceTimersByTimeAsync(1000)

    expect(ended).toHaveBeenCalled()
    expect(calls).toEqual([[0, 'reset']])
    expect(error).not.toHaveBeenCalled()
  })

  it('types no further once the signal aborts between keystrokes', async () => {
    const error = vi.spyOn(console, 'error')
    const { calls, view } = recorder()
    const controller = new AbortController()
    void playLoop([{ type: 'command', text: 'ab' }], FAST, view, controller.signal)
    await vi.advanceTimersByTimeAsync(0)

    // The keystroke timer fires, and the abort lands before the typing loop resumes.
    vi.advanceTimersByTime(10)
    controller.abort()
    await vi.advanceTimersByTimeAsync(1000)

    expect(calls.filter(([, method]) => method === 'setCommand')).toEqual([[0, 'setCommand', '']])
    expect(error).not.toHaveBeenCalled()
  })

  it('stops after the cycle in which the signal aborts', async () => {
    const controller = new AbortController()
    const { calls, view } = recorder((method) => {
      if (method === 'addLine') controller.abort()
    })
    const ended = vi.fn()
    void playLoop(
      [{ type: 'output', text: 'once' }],
      { ...FAST, restartDelay: 0 },
      view,
      controller.signal,
    ).then(ended)

    await vi.advanceTimersByTimeAsync(0)

    expect(ended).toHaveBeenCalled()
    expect(calls).toEqual([
      [0, 'reset'],
      [0, 'addLine', { type: 'output', text: 'once' }],
      [0, 'setPrompt', true],
    ])
  })

  it('plays nothing when the signal is aborted before it starts', async () => {
    const { calls, view } = recorder()
    const controller = new AbortController()
    controller.abort()

    await playLoop([{ type: 'output', text: 'x' }], FAST, view, controller.signal)

    expect(calls).toEqual([])
  })

  function throwing(err: unknown): TerminalStep[] {
    return [
      {
        type: 'output',
        get text(): string {
          throw err
        },
      },
    ]
  }

  it('treats a plain Error named AbortError as an abort', async () => {
    const error = vi.spyOn(console, 'error')
    const abort = new Error('Aborted')
    abort.name = 'AbortError'

    await playLoop(throwing(abort), FAST, recorder().view, new AbortController().signal)

    expect(error).not.toHaveBeenCalled()
  })

  it('logs any other Error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const boom = new Error('Unexpected Boom')

    await playLoop(throwing(boom), FAST, recorder().view, new AbortController().signal)

    expect(error).toHaveBeenCalledWith('Terminal simulation error:', boom)
  })

  it('logs a DOMException that is not an abort', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const timeout = new DOMException('Timed out', 'TimeoutError')

    await playLoop(throwing(timeout), FAST, recorder().view, new AbortController().signal)

    expect(error).toHaveBeenCalledWith('Terminal simulation error:', timeout)
  })

  it('logs a thrown value that is not an error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    await playLoop(throwing('AbortError'), FAST, recorder().view, new AbortController().signal)

    expect(error).toHaveBeenCalledWith('Terminal simulation error:', 'AbortError')
  })
})
