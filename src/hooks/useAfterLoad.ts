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

import { useEffect, useState } from 'react'

/** Longest wait for an idle moment after load, so a busy page still gets there. */
const IDLE_TIMEOUT_MS = 2000

/** Whether the page has loaded and the browser has gone idle, for work kept out of the first load. */
export function useAfterLoad(): boolean {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let idle: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const markReady = () => {
      idle = undefined
      timer = undefined
      setReady(true)
    }

    const schedule = () => {
      if (typeof requestIdleCallback === 'function') {
        idle = requestIdleCallback(markReady, { timeout: IDLE_TIMEOUT_MS })
      } else {
        timer = setTimeout(markReady, 0)
      }
    }

    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })

    return () => {
      window.removeEventListener('load', schedule)
      if (idle !== undefined) cancelIdleCallback(idle)
      if (timer !== undefined) clearTimeout(timer)
    }
  }, [])

  return ready
}
