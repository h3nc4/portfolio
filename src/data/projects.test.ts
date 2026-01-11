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

import { SiGithub } from 'react-icons/si'
import { describe, expect, it } from 'vitest'

import { hydrateProject, MINOR_PROJECTS, type Project } from './projects'

describe('Data Integrity: MINOR_PROJECTS', () => {
  it('should be an array of projects', () => {
    expect(Array.isArray(MINOR_PROJECTS)).toBe(true)
    expect(MINOR_PROJECTS.length).toBeGreaterThan(0)
  })

  it('should have valid properties for each project', () => {
    MINOR_PROJECTS.forEach((project: Project) => {
      expect(project.title).toBeTruthy()
      expect(project.description).toBeTruthy()
      expect(Array.isArray(project.tags)).toBe(true)
      expect(project.tags.length).toBeGreaterThan(0)
      expect(Array.isArray(project.links)).toBe(true)
      expect(project.links.length).toBeGreaterThan(0)
    })
  })

  it('should correctly hydrate icons for links', () => {
    MINOR_PROJECTS.forEach((project) => {
      project.links.forEach((link) => {
        expect(link.icon).toBeDefined()
        expect(typeof link.icon).toBe('function') // React component
      })
    })
  })

  it('should format demo steps with correct union types', () => {
    MINOR_PROJECTS.forEach((project) => {
      if (project.demo) {
        expect(Array.isArray(project.demo)).toBe(true)
        project.demo.forEach((step) => {
          expect(step.text).toBeDefined()
          expect(['command', 'output']).toContain(step.type)
        })
      }
    })
  })
})

describe('hydrateProject', () => {
  it('falls back to SiGithub when icon is not found', () => {
    const mockRawProject = {
      title: 'Test Project',
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
    }

    const result = hydrateProject(mockRawProject)
    expect(result.links[0].icon).toBe(SiGithub)
  })
})
