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

import { Download, ExternalLink, GitBranch } from 'lucide-react'
import type { ComponentType } from 'react'
import { SiGithub } from 'react-icons/si'

import { siblingUrl } from '@/lib/entrance'

export interface FeaturedLink {
  readonly label: string
  readonly href: string
  readonly icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>
  readonly ariaLabel?: string
  /** A download stays in the same tab, since a new one would only flash open and close. */
  readonly sameTab?: boolean
}

/** A project shown in its own column under its preview. The first link is the primary action. */
export interface FeaturedProjectData {
  readonly id: string
  readonly title: string
  readonly stack: string
  readonly description: string
  readonly links: readonly FeaturedLink[]
}

export const HYPERGESTURE: FeaturedProjectData = {
  id: 'hypergesture',
  title: 'HyperGesture',
  stack: 'Kotlin / Compose / Android',
  description:
    'Restores the full-screen gestures Xiaomi HyperOS drops once a third-party launcher is the default. Back, home and recents run through an accessibility service, with no root or ADB.',
  links: [
    { label: 'Website', href: 'https://hypergesture.h3nc4.com', icon: ExternalLink },
    {
      label: 'Download APK',
      href: 'https://github.com/h3nc4/HyperGesture/releases/latest/download/hypergesture.apk',
      icon: Download,
      sameTab: true,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/h3nc4/HyperGesture',
      icon: SiGithub,
      ariaLabel: 'HyperGesture on GitHub',
    },
  ],
}

export const WASUDOKU: FeaturedProjectData = {
  id: 'wasudoku',
  title: 'WASudoku',
  stack: 'Vite / Rust / TS / PWA',
  description:
    'A Sudoku solver and generator written in Rust and compiled to WebAssembly, so it runs entirely in the browser. It solves by logic first and backtracking second, and shows each step.',
  links: [
    { label: 'Open App', href: siblingUrl('wasudoku'), icon: ExternalLink },
    {
      label: 'GitHub',
      href: 'https://github.com/h3nc4/WASudoku',
      icon: SiGithub,
      ariaLabel: 'WASudoku on GitHub',
    },
    {
      label: 'cgit',
      href: 'https://cgit.h3nc4.com/WASudoku',
      icon: GitBranch,
      ariaLabel: 'WASudoku on cgit',
    },
  ],
}
