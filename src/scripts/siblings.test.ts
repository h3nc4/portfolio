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

import { siblingUrl } from '@/lib/entrance'

import { retargetSiblings } from './siblings'

const ONION = { protocol: 'http:', host: 'example2345abcdef.onion' }

// A loaded window without idle callbacks, so afterLoad falls back to a timer the test controls.
const loadedWindow = {
  document: { readyState: 'complete' },
  addEventListener: () => {},
  removeEventListener: () => {},
} as unknown as Window

// Detached, so a real browser never fetches the frame it points at.
function fixture() {
  const root = document.createElement('div')
  root.innerHTML = `
    <a data-sibling="wasudoku" href="https://wasudoku.h3nc4.com">WASudoku</a>
    <a data-sibling="bolao" href="https://bolao.h3nc4.com">Bolão</a>
    <a href="https://github.com/h3nc4">GitHub</a>
    <iframe data-sibling-src="wasudoku" title="WASudoku"></iframe>
    <iframe data-sibling-src="bolao" title="Bolão"></iframe>
  `
  return root
}

describe('retargetSiblings', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('points every sibling link at the host this visit came in on, at once', () => {
    const root = fixture()
    retargetSiblings(root, ONION, loadedWindow)

    const links = [...root.querySelectorAll('a')].map((a) => a.getAttribute('href'))
    expect(links).toEqual([
      siblingUrl('wasudoku', ONION),
      siblingUrl('bolao', ONION),
      'https://github.com/h3nc4',
    ])
  })

  it('leaves every frame empty until the page has loaded and gone idle', () => {
    const root = fixture()
    retargetSiblings(root, ONION, loadedWindow)

    for (const frame of root.querySelectorAll('iframe')) expect(frame).not.toHaveAttribute('src')

    vi.runAllTimers()
    const frames = [...root.querySelectorAll('iframe')].map((f) => f.getAttribute('src'))
    expect(frames).toEqual([siblingUrl('wasudoku', ONION), siblingUrl('bolao', ONION)])
  })

  it('never boots a frame once cancelled', () => {
    const root = fixture()
    const cancel = retargetSiblings(root, ONION, loadedWindow)

    cancel()
    vi.runAllTimers()

    for (const frame of root.querySelectorAll('iframe')) expect(frame).not.toHaveAttribute('src')
  })

  it('defaults to the document and location of this page', () => {
    vi.useRealTimers()
    const link = document.createElement('a')
    link.dataset.sibling = 'wasudoku'
    document.body.append(link)

    const cancel = retargetSiblings()
    cancel()
    link.remove()

    expect(link).toHaveAttribute('href', siblingUrl('wasudoku', location))
  })
})
