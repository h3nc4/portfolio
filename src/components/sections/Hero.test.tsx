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

import { Hero } from './Hero'

// Mock AnimatedContent to avoid GSAP issues
vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Hero', () => {
  it('renders heading and description', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /Henrique Almeida/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Software & DevOps Engineer/i)).toBeInTheDocument()
  })

  it('renders social and contact buttons', () => {
    render(<Hero />)

    const githubLink = screen.getByText('GitHub').closest('a')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/h3nc4')

    const linkedinLink = screen.getByText('LinkedIn').closest('a')
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/h3nc4')

    const contactLink = screen.getByText('Contact Me').closest('a')
    expect(contactLink).toHaveAttribute('href', 'mailto:me@h3nc4.com')
  })
})
