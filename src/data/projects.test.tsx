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

import { GitBranch } from 'lucide-react'
import { SiGithub } from 'react-icons/si'
import { describe, expect, it } from 'vitest'

import {
  DEMO_PROJECTS,
  EXTRAS,
  FAMILIES,
  hydrateProject,
  type Project,
  type RawProject,
  SELECTED_PROJECTS,
  toDemoProject,
} from './projects'

function expectValidProject(project: Project) {
  expect(project.title).toBeTruthy()
  expect(project.language).toBeTruthy()
  expect(project.description).toBeTruthy()
  expect(Array.isArray(project.tags)).toBe(true)
  expect(project.tags.length).toBeGreaterThan(0)
  expect(Array.isArray(project.links)).toBe(true)
  expect(project.links.length).toBeGreaterThan(0)

  project.links.forEach((link) => {
    expect(link.name).toBeTruthy()
    expect(link.url).toMatch(/^https:\/\//)
    expect(typeof link.icon).toMatch(/function|object/) // React component
  })
}

describe('Data Integrity: SELECTED_PROJECTS', () => {
  it('should be a non-empty array of valid projects', () => {
    expect(Array.isArray(SELECTED_PROJECTS)).toBe(true)
    expect(SELECTED_PROJECTS.length).toBeGreaterThan(0)
    SELECTED_PROJECTS.forEach(expectValidProject)
  })

  it('should not carry terminal demos', () => {
    SELECTED_PROJECTS.forEach((project) => {
      expect(project.demo).toBeUndefined()
    })
  })
})

describe('Data Integrity: DEMO_PROJECTS', () => {
  it('should provide one demo per section that shows one', () => {
    expect(DEMO_PROJECTS).toHaveLength(1)
  })

  it('should be valid projects carrying a populated demo', () => {
    DEMO_PROJECTS.forEach((project) => {
      expectValidProject(project)
      expect(project.demo.length).toBeGreaterThan(0)
    })
  })

  it('should format demo steps with correct union types', () => {
    DEMO_PROJECTS.forEach((project) => {
      project.demo.forEach((step) => {
        expect(['command', 'output', 'custom']).toContain(step.type)

        if (step.type === 'custom') {
          expect(step.component).not.toBeUndefined()
        } else {
          expect(step.text).toBeDefined()
        }
      })
    })
  })
})

describe('Data Integrity: FAMILIES', () => {
  it('should group repositories under a name', () => {
    expect(FAMILIES.length).toBeGreaterThan(0)

    FAMILIES.forEach((family) => {
      expect(family.name).toBeTruthy()
      expect(family.items.length).toBeGreaterThan(0)

      family.items.forEach((item) => {
        expect(item.title).toBeTruthy()
        expect(item.what).toBeTruthy()
        expect(item.url).toMatch(/^https:\/\//)
      })
    })
  })
})

describe('Data Integrity: EXTRAS', () => {
  it('should name and link every mention', () => {
    expect(EXTRAS.length).toBeGreaterThan(0)

    EXTRAS.forEach((extra) => {
      expect(extra.title).toBeTruthy()
      expect(extra.url).toMatch(/^https:\/\//)
    })
  })
})

describe('hydrateProject', () => {
  it('falls back to SiGithub when icon is not found', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'C',
      description: 'Test Description',
      tags: ['Test'],
      links: [
        {
          name: 'Broken Link',
          url: 'https://example.com',
          icon: 'NonExistentIcon', // This forces the fallback
        },
      ],
      demo: [],
    } as unknown as RawProject

    const result = hydrateProject(mockRawProject)
    expect(result.links[0].icon).toBe(SiGithub)
  })

  it('hydrates GitBranch icon correctly', () => {
    const mockRawProject = {
      title: 'Test',
      language: 'C',
      description: 'Desc',
      tags: [],
      links: [
        {
          name: 'Mirror',
          url: 'https://cgit.example.com',
          icon: 'GitBranch',
        },
      ],
    } as unknown as RawProject

    const result = hydrateProject(mockRawProject)
    expect(result.links[0].icon).toBe(GitBranch)
  })

  it('hydrates custom media components', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'C',
      description: 'Desc',
      tags: [],
      links: [],
      demo: [
        {
          type: 'custom',
          media: 'rick-roll',
          delay: 100,
        },
      ],
    } as unknown as RawProject

    const result = hydrateProject(mockRawProject)
    expect(result.demo?.[0].component).toBeDefined()
    expect(result.demo?.[0].component).not.toBeNull()
  })

  it('returns null component when media key is not found', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'C',
      description: 'Desc',
      tags: [],
      links: [],
      demo: [
        {
          type: 'custom',
          media: 'unknown-key',
          delay: 100,
        },
      ],
    } as unknown as RawProject

    const result = hydrateProject(mockRawProject)
    expect(result.demo?.[0].component).toBeNull()
  })

  it('handles steps without text property gracefully', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'C',
      description: 'Desc',
      tags: [],
      links: [],
      demo: [
        {
          type: 'command',
          delay: 100,
          // text property is missing
        },
      ],
    } as unknown as RawProject

    const result = hydrateProject(mockRawProject)
    expect(result.demo?.[0].text).toBeUndefined()
  })
})

describe('toDemoProject', () => {
  it('keeps the demo it was given', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'Dockerfile',
      description: 'Desc',
      tags: [],
      links: [],
      demo: [{ type: 'output', text: 'done' }],
    } as unknown as RawProject

    expect(toDemoProject(mockRawProject).demo).toHaveLength(1)
  })

  it('substitutes an empty demo when the raw project has none', () => {
    const mockRawProject = {
      title: 'Test Project',
      language: 'Dockerfile',
      description: 'Desc',
      tags: [],
      links: [],
      // demo property is missing
    } as unknown as RawProject

    expect(toDemoProject(mockRawProject).demo).toEqual([])
  })
})
