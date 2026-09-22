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

import { DEMO_PROJECTS, SELECTED_PROJECTS } from '@/data/projects'

import { SelectedProjects } from './SelectedProjects'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/TerminalDemo', () => ({
  TerminalDemo: ({ script }: { script: unknown[] }) => (
    <div data-testid="mock-terminal" data-steps={script.length} />
  ),
}))

describe('SelectedProjects', () => {
  it('renders section header and intro', () => {
    render(<SelectedProjects />)
    expect(
      screen.getByRole('heading', { name: /Selected Projects/i, level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/A distribution, a phone gesture layer/i)).toBeInTheDocument()
  })

  it('renders a row per selected project', () => {
    render(<SelectedProjects />)

    SELECTED_PROJECTS.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument()
      expect(screen.getByText(project.description)).toBeInTheDocument()
      expect(screen.getAllByText(project.language).length).toBeGreaterThan(0)
    })
  })

  it('links each row to its first link', () => {
    render(<SelectedProjects />)

    SELECTED_PROJECTS.forEach((project) => {
      const row = screen.getByText(project.title).closest('a')
      expect(row).toHaveAttribute('href', project.links[0].url)
      expect(row).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders tags for every project', () => {
    render(<SelectedProjects />)

    SELECTED_PROJECTS.forEach((project) => {
      project.tags.forEach((tag) => {
        // Tags such as Docker repeat across projects, so one match is enough
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
      })
    })
  })

  it('plays the first demo in place of a sixth row', () => {
    render(<SelectedProjects />)

    const demo = DEMO_PROJECTS[0]
    const terminal = screen.getByTestId('mock-terminal')
    expect(terminal).toHaveAttribute('data-steps', String(demo.demo.length))
    expect(screen.getByText(demo.title)).toBeInTheDocument()

    const sourceLink = screen.getByRole('link', { name: demo.links[0].name })
    expect(sourceLink).toHaveAttribute('href', demo.links[0].url)
  })
})
