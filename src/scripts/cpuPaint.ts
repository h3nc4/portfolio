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

// Ladybird paints on the CPU, where the panel blur and the fixed layers cost a frame each.
// `?cpu-paint=1` or `?cpu-paint=0` overrides the guess, to compare the two looks.
export function markCpuPaint(root: Element, userAgent: string, search: string): void {
  const forced = new URLSearchParams(search).get('cpu-paint')
  const detected = /\bLadybird\//.test(userAgent)
  root.classList.toggle('cpu-paint', forced === null ? detected : forced === '1')
}

/** The marker as an inline head script, so the class is set before the first paint. */
export const CPU_PAINT_SCRIPT = `(${markCpuPaint.toString()})(document.documentElement, navigator.userAgent, location.search)`
