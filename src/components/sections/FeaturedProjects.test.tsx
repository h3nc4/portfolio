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

import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FeaturedProjects } from './FeaturedProjects'

vi.mock('@/components/DeviceFrame', () => ({
  DeviceFrame: ({ title, src }: { title: string; src: string }) => (
    <div data-testid="mock-device-frame" aria-label={title} data-src={src} />
  ),
}))

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('FeaturedProjects', () => {
  it('puts both projects under one heading', () => {
    render(<FeaturedProjects />)

    expect(screen.getByRole('heading', { name: 'Featured Projects', level: 2 })).toBeInTheDocument()
    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['HyperGesture', 'WASudoku'])
  })

  it('gives each column its own preview', () => {
    render(<FeaturedProjects />)
    const [hyperGesture, wasudoku] = screen.getAllByRole('article')

    expect(hyperGesture).toHaveAttribute('id', 'hypergesture')
    expect(
      within(hyperGesture).getByRole('img', { name: /HyperGesture home screen/i }),
    ).toBeInTheDocument()

    expect(wasudoku).toHaveAttribute('id', 'wasudoku')
    expect(within(wasudoku).getByTestId('mock-device-frame')).toHaveAttribute(
      'data-src',
      `${location.protocol}//wasudoku.${location.host}`,
    )
  })
})
