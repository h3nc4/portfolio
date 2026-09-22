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

import { EXTRAS, FAMILIES } from '@/data/projects'

import { ProjectFamilies } from './ProjectFamilies'

vi.mock('@/components/AnimatedContent', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('ProjectFamilies', () => {
  it('renders section header and intro', () => {
    render(<ProjectFamilies />)
    expect(
      screen.getByRole('heading', { name: /Repository Families/i, level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Each family is one idea repeated/i)).toBeInTheDocument()
  })

  it('renders every family under its own heading', () => {
    render(<ProjectFamilies />)

    FAMILIES.forEach((family) => {
      expect(screen.getByRole('heading', { name: family.name, level: 3 })).toBeInTheDocument()
    })
  })

  it('renders every repository in every family, linked', () => {
    render(<ProjectFamilies />)

    FAMILIES.forEach((family) => {
      family.items.forEach((item) => {
        expect(screen.getByText(item.what)).toBeInTheDocument()
        expect(screen.getByText(item.title).closest('a')).toHaveAttribute('href', item.url)
      })
    })
  })

  it('shows no terminal demo, since no single one covers three families', () => {
    render(<ProjectFamilies />)
    expect(screen.queryByTestId('mock-terminal')).not.toBeInTheDocument()
  })

  it('mentions the smaller repositories and the mirror', () => {
    render(<ProjectFamilies />)

    expect(screen.getByText(/Smaller things/i)).toBeInTheDocument()

    EXTRAS.forEach((extra) => {
      const link = screen.getByRole('link', { name: extra.title })
      expect(link).toHaveAttribute('href', extra.url)
    })

    expect(screen.getByRole('link', { name: /all of it on cgit/i })).toHaveAttribute(
      'href',
      'https://cgit.h3nc4.com',
    )
  })
})
