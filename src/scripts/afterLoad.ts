/** Longest wait for an idle moment after load, so a busy page still gets there. */
const IDLE_TIMEOUT_MS = 2000

/** Runs once the page has loaded and the browser has gone idle, for work kept out of the first load. */
export function afterLoad(run: () => void, win: Window = window): () => void {
  let idle: number | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const fire = () => {
    idle = undefined
    timer = undefined
    run()
  }

  const schedule = () => {
    if (typeof win.requestIdleCallback === 'function') {
      idle = win.requestIdleCallback(fire, { timeout: IDLE_TIMEOUT_MS })
    } else {
      timer = setTimeout(fire, 0)
    }
  }

  if (win.document.readyState === 'complete') schedule()
  else win.addEventListener('load', schedule, { once: true })

  return () => {
    win.removeEventListener('load', schedule)
    if (idle !== undefined) win.cancelIdleCallback(idle)
    if (timer !== undefined) clearTimeout(timer)
  }
}
