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
import type { ElementType } from 'react'
import { SiGithub } from 'react-icons/si'

import { RickRoll } from '@/components/RickRoll'
import type { TerminalStep } from '@/components/TerminalDemo'

import rawData from './projects.json'

export interface ProjectLink {
  name: string
  url: string
  icon: ElementType
}

export interface Project {
  title: string
  language: string
  description: string
  tags: string[]
  links: ProjectLink[]
  demo?: TerminalStep[]
}

/** One repository inside a family, carrying only enough to name and link it. */
export interface FamilyItem {
  title: string
  what: string
  url: string
}

/** A group of repositories that share one idea, listed compactly rather than as cards. */
export interface Family {
  name: string
  items: FamilyItem[]
}

/** A repository that gets a name and a link. */
export interface Extra {
  title: string
  url: string
}

/** A project whose demo is known to exist, so consumers do not have to guard it. */
export interface DemoProject extends Project {
  demo: TerminalStep[]
}

export interface RawProjectLink {
  name: string
  url: string
  icon: string
}

export interface RawProject {
  title: string
  language: string
  description: string
  tags: string[]
  links: RawProjectLink[]
  demo?: unknown[]
}

interface RawData {
  selected: RawProject[]
  demos: RawProject[]
  families: Family[]
  extras: Extra[]
}

const ICON_MAP: Record<string, ElementType> = {
  SiGithub,
  GitBranch,
}

const MEDIA_MAP: Record<string, React.ReactNode> = {
  'rick-roll': <RickRoll />,
}

const data = rawData as RawData

/**
 * Transforms raw JSON project data into a fully typed Project object.
 * Maps string icon names to actual React components.
 */
export function hydrateProject(project: RawProject): Project {
  return {
    title: project.title,
    language: project.language,
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

/** Projects that each get their own row, one per domain rather than one per repository. */
export const SELECTED_PROJECTS: Project[] = data.selected.map(hydrateProject)

/** Hydrates a project and guarantees its demo, so consumers do not have to guard it. */
export function toDemoProject(raw: RawProject): DemoProject {
  const project = hydrateProject(raw)

  return { ...project, demo: project.demo ?? [] }
}

/**
 * Projects whose terminal output stands for a whole family.
 * The first plays inside the selected rows, the second above the families.
 */
export const DEMO_PROJECTS: DemoProject[] = data.demos.map(toDemoProject)

/** Repository groups that share one idea, so listing each one separately would repeat it. */
export const FAMILIES: Family[] = data.families

/** Repositories that get a name and a link. */
export const EXTRAS: Extra[] = data.extras
