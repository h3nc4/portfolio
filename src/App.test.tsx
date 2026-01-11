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

import App from './App'

// Mock heavy visual components to ensure integration tests run smoothly in JSDOM
vi.mock('@/components/DarkVeil', () => ({
  DarkVeil: () => <div data-testid="mock-dark-veil" />,
}))

vi.mock('@/components/DeviceFrame', () => ({
  DeviceFrame: ({ title, src }: { title: string; src: string }) => (
    <div data-testid="mock-device-frame" aria-label={title} data-src={src} />
  ),
}))

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="animated-content" className={className}>
      {children}
    </div>
  ),
}))

describe('App', () => {
  it('renders main structure and background', () => {
    render(<App />)
    expect(screen.getByTestId('mock-dark-veil')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument() // <aside>
  })

  it('composes all key sections', () => {
    render(<App />)

    // Hero Section Content
    expect(screen.getByRole('heading', { name: /Henrique Almeida/i, level: 1 })).toBeInTheDocument()

    // Featured Project Content
    expect(screen.getByText('Featured Project')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'WASudoku', level: 2 })).toBeInTheDocument()

    // Visual Showcase
    expect(screen.getByTestId('mock-device-frame')).toBeInTheDocument()

    // Minor Projects Content
    expect(screen.getByRole('heading', { name: /Other Projects/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByText('yt-dlp-slim')).toBeInTheDocument()

    // Footer
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
