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
import { vi } from 'vitest'

import App from './App'

// Mock DarkVeil to avoid WebGL context issues in App integration tests
vi.mock('@/components/DarkVeil', () => ({
  DarkVeil: () => <div data-testid="mock-dark-veil" />,
}))

// Mock DeviceFrame to avoid iframe loading issues in tests
vi.mock('@/components/DeviceFrame', () => ({
  DeviceFrame: ({ title, src }: { title: string; src: string }) => (
    <div data-testid="mock-device-frame" aria-label={title} data-src={src} />
  ),
}))

describe('App', () => {
  it('renders main layout structure', () => {
    render(<App />)

    // Verify Semantic Layout structure
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // <aside>

    // Check for DarkVeil
    expect(screen.getByTestId('mock-dark-veil')).toBeInTheDocument()
  })

  it('renders hero content', () => {
    render(<App />)

    // Heading
    expect(screen.getByRole('heading', { name: /Henrique Almeida/i, level: 1 })).toBeInTheDocument()
    // Description
    expect(screen.getByText(/Software & DevOps Engineer/i)).toBeInTheDocument()

    // Hero Buttons
    expect(screen.getByText('GitHub')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('Contact Me')).toBeInTheDocument()
  })

  it('renders featured project section', () => {
    render(<App />)

    expect(screen.getByText('Featured Project')).toBeInTheDocument()
    expect(screen.getByText('WASudoku')).toBeInTheDocument()
    expect(screen.getByText(/A high-performance Sudoku solver and generator/i)).toBeInTheDocument()

    // Check Links
    const openAppLink = screen.getByRole('link', { name: /Open App/i })
    expect(openAppLink).toHaveAttribute('href', 'https://wasudoku.h3nc4.com')

    const sourceCodeLink = screen.getByRole('link', { name: /Source Code/i })
    expect(sourceCodeLink).toHaveAttribute('href', 'https://github.com/h3nc4/WASudoku')
  })

  it('renders visual showcase', () => {
    render(<App />)

    const deviceFrame = screen.getByTestId('mock-device-frame')
    expect(deviceFrame).toBeInTheDocument()
    expect(deviceFrame).toHaveAttribute('data-src', 'https://wasudoku.h3nc4.com')
  })

  it('renders footer', () => {
    render(<App />)
    expect(screen.getByText(/© 2026 Henrique Almeida/i)).toBeInTheDocument()
  })
})
