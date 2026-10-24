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

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HYPERGESTURE, WASUDOKU } from '@/data/featured'

import { FeaturedProject } from './FeaturedProject'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const PREVIEW = <div data-testid="preview" />

describe('FeaturedProject', () => {
  it('renders WASudoku with its stack', () => {
    render(<FeaturedProject project={WASUDOKU} preview={PREVIEW} />)
    expect(screen.getByRole('heading', { name: 'WASudoku', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('Vite / Rust / TS / PWA')).toBeInTheDocument()
  })

  it('renders WASudoku links', () => {
    render(<FeaturedProject project={WASUDOKU} preview={PREVIEW} />)

    const openAppLink = screen.getByRole('link', { name: /Open App/i })
    expect(openAppLink).toHaveAttribute('href', `${location.protocol}//wasudoku.${location.host}`)

    const sourceLink = screen.getByRole('link', { name: /GitHub/i })
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/h3nc4/WASudoku')

    const mirrorLink = screen.getByRole('link', { name: /cgit/i })
    expect(mirrorLink).toHaveAttribute('href', 'https://cgit.h3nc4.com/WASudoku')
  })

  it('renders HyperGesture with its stack', () => {
    render(<FeaturedProject project={HYPERGESTURE} preview={PREVIEW} />)
    expect(screen.getByRole('heading', { name: 'HyperGesture', level: 3 })).toBeInTheDocument()
    expect(screen.getByText('Kotlin / Compose / Android')).toBeInTheDocument()
    expect(screen.getByText(/third-party launcher/i)).toBeInTheDocument()
  })

  it('renders HyperGesture links, the APK in the same tab', () => {
    render(<FeaturedProject project={HYPERGESTURE} preview={PREVIEW} />)

    const websiteLink = screen.getByRole('link', { name: /Website/i })
    expect(websiteLink).toHaveAttribute('href', 'https://hypergesture.h3nc4.com')
    expect(websiteLink).toHaveAttribute('target', '_blank')
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer')

    const apkLink = screen.getByRole('link', { name: /Download APK/i })
    expect(apkLink).toHaveAttribute(
      'href',
      'https://github.com/h3nc4/HyperGesture/releases/latest/download/hypergesture.apk',
    )
    expect(apkLink).not.toHaveAttribute('target')

    const sourceLink = screen.getByRole('link', { name: 'HyperGesture on GitHub' })
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/h3nc4/HyperGesture')
  })

  it('gives the first link the primary style', () => {
    render(<FeaturedProject project={HYPERGESTURE} preview={PREVIEW} />)
    const [primary, ...rest] = screen.getAllByRole('link')

    expect(primary).toHaveClass('bg-dawn-accent')
    rest.forEach((link) => expect(link).not.toHaveClass('bg-dawn-accent'))
  })

  it('puts the preview above the text, in a column that carries the project id', () => {
    render(<FeaturedProject project={WASUDOKU} preview={PREVIEW} />)
    const column = screen.getByRole('article')
    const preview = screen.getByTestId('preview')

    expect(column).toHaveAttribute('id', 'wasudoku')
    expect(column).toContainElement(preview)
    expect(preview.compareDocumentPosition(screen.getByRole('heading'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })
})
