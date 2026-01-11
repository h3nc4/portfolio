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

import type { IconType } from 'react-icons'
import { SiGithub } from 'react-icons/si'

import { RickRoll } from '@/components/RickRoll'
import type { TerminalStep } from '@/components/TerminalDemo'

import rawProjects from './projects.json'

export interface ProjectLink {
  name: string
  url: string
  icon: IconType
}

export interface Project {
  title: string
  description: string
  tags: string[]
  links: ProjectLink[]
  demo?: TerminalStep[]
}

const ICON_MAP: Record<string, IconType> = {
  SiGithub,
}

const MEDIA_MAP: Record<string, React.ReactNode> = {
  'rick-roll': <RickRoll />,
}

export type RawProject = (typeof rawProjects)[number]

/**
 * Transforms raw JSON project data into a fully typed Project object.
 * Maps string icon names to actual React components.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function hydrateProject(project: RawProject): Project {
  return {
    title: project.title,
    description: project.description,
    tags: project.tags,
    links: project.links.map((link) => ({
      name: link.name,
      url: link.url,
      // Fallback to SiGithub if the icon key is not found in the map
      icon: ICON_MAP[link.icon] ?? SiGithub,
    })),
    demo: project.demo?.map((step) => {
      const s = step as {
        type: string
        delay?: number
        text?: string
        media?: string
      }

      const base = {
        type: s.type as 'command' | 'output' | 'custom',
        delay: s.delay,
      }

      if (base.type === 'custom' && s.media) {
        const component = MEDIA_MAP[s.media] ?? null

        return {
          ...base,
          component,
        }
      }

      return {
        ...base,
        text: s.text,
      }
    }),
  }
}

/**
 * List of minor or secondary projects to be displayed in the grid section.
 * Data is loaded from projects.json and hydrated with React icons.
 */
export const MINOR_PROJECTS: Project[] = rawProjects.map(hydrateProject)
