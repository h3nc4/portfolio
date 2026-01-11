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

import { MINOR_PROJECTS } from '@/data/projects'

import { MinorProjects } from './MinorProjects'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('MinorProjects', () => {
  it('renders section header', () => {
    render(<MinorProjects />)
    expect(screen.getByRole('heading', { name: /Other Projects/i, level: 2 })).toBeInTheDocument()
  })

  it('renders all projects from data', () => {
    render(<MinorProjects />)
    MINOR_PROJECTS.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument()
      expect(screen.getByText(project.description)).toBeInTheDocument()
    })
  })

  it('renders tags for projects', () => {
    render(<MinorProjects />)
    const firstProject = MINOR_PROJECTS[0]
    firstProject.tags.forEach((tag) => {
      // Tags like "Docker" appear multiple times, check if at least one exists
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
    })
  })

  it('renders links for projects', () => {
    render(<MinorProjects />)
    const links = screen.getAllByRole('link', { name: /Source/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', MINOR_PROJECTS[0].links[0].url)
  })
})
