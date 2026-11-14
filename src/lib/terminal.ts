/** The media a custom step can play, each a template `TerminalDemo.astro` renders. */
export const MEDIA = ['rick-roll'] as const

export type MediaName = (typeof MEDIA)[number]

export interface TerminalStep {
  text?: string
  media?: MediaName
  type: 'command' | 'output' | 'custom'
  delay?: number
}

/** What a script draws on, so the timing below runs the same against a DOM or a test. */
export interface TerminalView {
  /** No lines, no command, and the prompt showing. */
  reset(): void
  setCommand(text: string): void
  setPrompt(shown: boolean): void
  addLine(line: Omit<TerminalStep, 'delay'>): void
}

export interface TerminalTiming {
  /** Delay in ms before the script starts playing */
  readonly startDelay: number
  /** Delay in ms before restarting the script after completion */
  readonly restartDelay: number
  /** Minimum delay in ms between keystrokes */
  readonly minTypingDelay: number
  /** Maximum delay in ms between keystrokes */
  readonly maxTypingDelay: number
}

export const DEFAULT_TIMING: TerminalTiming = {
  startDelay: 1000,
  restartDelay: 4000,
  minTypingDelay: 30,
  maxTypingDelay: 70,
}

const COMMAND_EXECUTION_DELAY = 300

/** Typing jitter. A pseudo-random source is safe, since it only paces an animation. */
function getRandomDelay(min: number, max: number) {
  return min + Math.random() * (max - min) // NOSONAR
}

/** A timeout that rejects with an AbortError once the signal aborts. */
export function wait(ms: number, signal: AbortSignal): Promise<void> {
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

async function typeCommand(
  text: string,
  timing: TerminalTiming,
  view: TerminalView,
  signal: AbortSignal,
) {
  for (let i = 0; i <= text.length; i++) {
    if (signal.aborted) return
    view.setCommand(text.slice(0, i))
    await wait(getRandomDelay(timing.minTypingDelay, timing.maxTypingDelay), signal) // NOSONAR each keystroke waits for the one before it
  }
}

async function runScriptStep(
  step: TerminalStep,
  timing: TerminalTiming,
  view: TerminalView,
  signal: AbortSignal,
) {
  if (step.delay) {
    await wait(step.delay, signal)
  }

  const text = step.text ?? ''

  if (step.type === 'command') {
    view.setPrompt(true)
    await typeCommand(text, timing, view, signal)
    await wait(COMMAND_EXECUTION_DELAY, signal)

    view.addLine({ type: 'command', text })
    view.setCommand('')
    view.setPrompt(false)
  } else if (step.type === 'custom') {
    view.addLine({ type: 'custom', media: step.media })
  } else {
    view.addLine({ type: 'output', text })
  }
}

/** One full cycle of the script: reset, start delay, every step, restart delay. */
export async function runCycle(
  script: readonly TerminalStep[],
  timing: TerminalTiming,
  view: TerminalView,
  signal: AbortSignal,
) {
  view.reset()

  if (timing.startDelay > 0) {
    await wait(timing.startDelay, signal)
  }

  for (const step of script) {
    await runScriptStep(step, timing, view, signal) // NOSONAR steps play in script order
  }

  view.setPrompt(true)

  if (timing.restartDelay > 0) {
    await wait(timing.restartDelay, signal)
  }
}

function isAbort(err: unknown): boolean {
  return (err instanceof DOMException || err instanceof Error) && err.name === 'AbortError'
}

/** Plays the script on a loop until the signal aborts, which ends it quietly. */
export async function playLoop(
  script: readonly TerminalStep[],
  timing: TerminalTiming,
  view: TerminalView,
  signal: AbortSignal,
) {
  try {
    while (!signal.aborted) {
      await runCycle(script, timing, view, signal) // NOSONAR a cycle starts once the last one ends
    }
  } catch (err) {
    if (isAbort(err)) return
    console.error('Terminal simulation error:', err)
  }
}
