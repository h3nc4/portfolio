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

// @vitest-environment node
// The underscore keeps Astro from routing this file as an endpoint of the page
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'

import { within } from '@testing-library/dom'

import Page from '@/pages/index.astro'
import { comments, parse, renderHtml } from '@/test/astro'

const PANELS = [
  'featured',
  'hypergesture',
  'wasudoku',
  'selected-projects',
  'containers',
  'infrastructure',
  'repository-families',
]

const BUILD_TIMEOUT = 120_000

async function page() {
  return parse(await renderHtml(Page))
}

describe('index page', () => {
  it('renders the main landmark with one article per featured project', async () => {
    const view = within((await page()).body)

    expect(view.getByRole('main')).toBeInTheDocument()
    expect(view.getAllByRole('article')).toHaveLength(2)
  })

  it('composes every section', async () => {
    const view = within((await page()).body)

    expect(view.getByRole('heading', { name: 'Henrique Almeida', level: 1 })).toBeInTheDocument()
    expect(
      view.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual([
      'Featured Projects',
      'Selected Projects',
      'Containers',
      'Infrastructure',
      'Repository Families',
    ])
    expect(view.getByText('Dreamweaver')).toBeInTheDocument()
    expect(view.getAllByText('nginx-slim').length).toBeGreaterThan(0)
    expect(view.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('previews HyperGesture in screenshots and WASudoku live', async () => {
    const view = within((await page()).body)
    const [first, second] = view.getAllByRole('article')

    expect(first).toContainElement(view.getByRole('img', { name: /HyperGesture home screen/ }))
    expect(second).toContainElement(view.getByTitle('WASudoku Live Preview'))
  })

  it('puts HyperGesture before WASudoku, both in the featured panel', async () => {
    const document = await page()
    const featured = document.getElementById('featured')
    const hyperGesture = document.getElementById('hypergesture')!
    const wasudoku = document.getElementById('wasudoku')!

    expect(featured).toContainElement(hyperGesture)
    expect(featured).toContainElement(wasudoku)
    expect(hyperGesture).toHaveTextContent('HyperGesture')
    expect(wasudoku).toHaveTextContent('WASudoku')
    expect(hyperGesture.compareDocumentPosition(wasudoku)).toBe(
      document.defaultView!.Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('gives every panel an id, so a link can reach one from outside', async () => {
    const document = await page()

    for (const id of PANELS) {
      expect(document.getElementById(id), id).not.toBeNull()
    }
  })

  it('puts the hero in the pinned section and the panels on the sheet above it', async () => {
    const document = await page()
    const sheet = document.querySelector('.hero-sheet')!

    expect(document.querySelector('.hero-pin .hero-body')).not.toBeNull()
    for (const id of ['featured', 'selected-projects', 'containers', 'infrastructure']) {
      expect(sheet, id).toContainElement(document.getElementById(id))
    }
    expect(sheet).toContainElement(document.getElementById('repository-families'))
  })

  it('shows every entrance at rest when scripts are off', async () => {
    const fallback = (await page()).head.querySelector('noscript')

    expect(fallback?.textContent).toMatch(/\.reveal\s*{\s*opacity:\s*1;\s*transform:\s*none;\s*}/)
  })

  it('preloads the painting at high priority', async () => {
    const preload = (await page()).head.querySelector('link[rel="preload"]')

    expect(preload).toHaveAttribute('as', 'image')
    expect(preload).toHaveAttribute('href', '/landscape.webp')
    expect(preload).toHaveAttribute('fetchpriority', 'high')
  })

  it('names itself in the head', async () => {
    const document = await page()

    expect(document.title).toBe('Henrique Almeida')
    expect(document.documentElement).toHaveAttribute('lang', 'en')
    expect(document.head.querySelector('meta[property="og:url"]')).toHaveAttribute(
      'content',
      'https://h3nc4.com/',
    )
  })

  describe('as built', () => {
    const root = path.resolve(import.meta.dirname, '../..')
    let outDir: string
    let built: Document

    // Inlining the stylesheet and bundling the script happen only in a build
    beforeAll(async () => {
      const cache = path.join(root, 'node_modules/.cache')
      await mkdir(cache, { recursive: true })
      outDir = await mkdtemp(path.join(cache, 'page-test-'))
      await promisify(execFile)(
        path.join(root, 'node_modules/.bin/astro'),
        ['build', '--outDir', outDir, '--silent'],
        { cwd: root },
      )
      built = parse(await readFile(path.join(outDir, 'index.html'), 'utf8'))
    }, BUILD_TIMEOUT)

    afterAll(async () => {
      if (outDir) await rm(outDir, { recursive: true, force: true })
    })

    it('ships exactly one script, a module', () => {
      const scripts = built.querySelectorAll('script')

      expect(scripts).toHaveLength(1)
      expect(scripts[0]).toHaveAttribute('type', 'module')
    })

    it('inlines the stylesheet and links none', () => {
      const styles = [...built.head.querySelectorAll(':scope > style')]

      expect(built.querySelector('link[rel~="stylesheet"]')).toBeNull()
      expect(styles.some((style) => style.textContent?.includes('.hero-pin'))).toBe(true)
    })

    it('preloads the painting at high priority', () => {
      const preload = built.head.querySelector('link[rel="preload"][as="image"]')

      expect(preload).toHaveAttribute('href', '/landscape.webp')
      expect(preload).toHaveAttribute('fetchpriority', 'high')
    })

    it('keeps the fallback for a visitor without scripts', () => {
      const fallback = built.head.querySelector('noscript')

      expect(fallback?.textContent).toMatch(
        /\.reveal\s*{\s*opacity:\s*1;\s*transform:\s*none;?\s*}/,
      )
    })

    it('carries no HTML comments', () => {
      expect(comments(built)).toEqual([])
    })
  })
})
