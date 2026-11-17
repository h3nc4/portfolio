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

import { CPU_PAINT_SCRIPT, markCpuPaint } from './cpuPaint'

const LADYBIRD =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ladybird/1.0 Chrome/140.0.0.0 Safari/537.36'
const CHROME =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

function marked(userAgent: string, search = '') {
  const root = document.createElement('html')
  markCpuPaint(root, userAgent, search)
  return root.classList.contains('cpu-paint')
}

describe('markCpuPaint', () => {
  it('marks Ladybird', () => {
    expect(marked(LADYBIRD)).toBe(true)
  })

  it('leaves other browsers alone', () => {
    expect(marked(CHROME)).toBe(false)
  })

  it('needs the product token, not the word alone', () => {
    expect(marked(`${CHROME} NotLadybird/1.0`)).toBe(false)
    expect(marked(`${CHROME} Ladybird`)).toBe(false)
  })

  it('forces the class on with ?cpu-paint=1', () => {
    expect(marked(CHROME, '?cpu-paint=1')).toBe(true)
  })

  it('forces the class off with ?cpu-paint=0', () => {
    expect(marked(LADYBIRD, '?cpu-paint=0')).toBe(false)
  })

  it('removes a class already set when forced off', () => {
    const root = document.createElement('html')
    root.classList.add('cpu-paint')
    markCpuPaint(root, LADYBIRD, '?utm=x&cpu-paint=0')

    expect(root).not.toHaveClass('cpu-paint')
  })
})

describe('CPU_PAINT_SCRIPT', () => {
  const run = (search: string) => {
    history.replaceState(null, '', `/${search}`)
    new Function(CPU_PAINT_SCRIPT)()
    return document.documentElement.classList.contains('cpu-paint')
  }

  afterEach(() => {
    vi.restoreAllMocks()
    document.documentElement.classList.remove('cpu-paint')
    history.replaceState(null, '', '/')
  })

  it('runs standalone against the live page', () => {
    expect(run('')).toBe(false)
    expect(run('?cpu-paint=1')).toBe(true)
    expect(run('?cpu-paint=0')).toBe(false)
  })

  it('reads the user agent', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(LADYBIRD)

    expect(run('')).toBe(true)
  })
})
