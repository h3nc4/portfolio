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

import { CONTAINER_PROJECTS } from '@/data/projects'

import { ContainerPreviews } from './ContainerPreviews'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/TerminalDemo', () => ({
  TerminalDemo: ({ script }: { script: unknown[] }) => (
    <div data-testid="mock-terminal" data-steps={script.length} />
  ),
}))

describe('ContainerPreviews', () => {
  it('renders section header and intro', () => {
    render(<ContainerPreviews />)

    expect(screen.getByRole('heading', { name: /Containers/i, level: 2 })).toBeInTheDocument()
    expect(screen.getByText(/One static binary on an empty filesystem/i)).toBeInTheDocument()
  })

  it('renders a card per container', () => {
    render(<ContainerPreviews />)

    CONTAINER_PROJECTS.forEach((project) => {
      expect(screen.getByRole('heading', { name: project.title, level: 3 })).toBeInTheDocument()
      expect(screen.getByText(project.description)).toBeInTheDocument()
    })
  })

  it('plays a terminal for every container', () => {
    render(<ContainerPreviews />)

    const terminals = screen.getAllByTestId('mock-terminal')
    expect(terminals).toHaveLength(CONTAINER_PROJECTS.length)
    terminals.forEach((terminal, index) => {
      expect(terminal).toHaveAttribute('data-steps', String(CONTAINER_PROJECTS[index].demo.length))
    })
  })

  it('renders tags for every container', () => {
    render(<ContainerPreviews />)

    CONTAINER_PROJECTS.forEach((project) => {
      project.tags.forEach((tag) => {
        // Docker repeats across the images, so one match is enough
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0)
      })
    })
  })

  it('makes the whole card the link to its source', () => {
    render(<ContainerPreviews />)

    CONTAINER_PROJECTS.forEach((project) => {
      const card = screen.getByText(project.title).closest('a')

      expect(card).toHaveAttribute('href', project.links[0].url)
      expect(card).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
