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

import { FeaturedProject } from './FeaturedProject'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('FeaturedProject', () => {
  it('renders title and project stack', () => {
    render(<FeaturedProject />)
    expect(screen.getByText('Featured Project')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'WASudoku', level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/Vite • Rust • TS • PWA/i)).toBeInTheDocument()
  })

  it('renders project links', () => {
    render(<FeaturedProject />)

    const openAppLink = screen.getByRole('link', { name: /Open App/i })
    expect(openAppLink).toHaveAttribute('href', 'https://wasudoku.h3nc4.com')

    const sourceLink = screen.getByRole('link', { name: /GitHub/i })
    expect(sourceLink).toHaveAttribute('href', 'https://github.com/h3nc4/WASudoku')

    const mirrorLink = screen.getByRole('link', { name: /cgit/i })
    expect(mirrorLink).toHaveAttribute('href', 'https://git.h3nc4.com/WASudoku')
  })
})
