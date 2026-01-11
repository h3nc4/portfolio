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
}

/**
 * List of minor or secondary projects to be displayed in the grid section.
 */
export const MINOR_PROJECTS: Project[] = [
  {
    title: 'yt-dlp-slim',
    description: 'A Distroless Docker container for yt-dlp with JavaScript and FFmpeg support.',
    tags: ['Docker', 'Actions'],
    links: [{ name: 'Source', url: 'https://github.com/h3nc4/yt-dlp-slim', icon: SiGithub }],
  },
  {
    title: 'tor-slim',
    description:
      'A single binary Docker container for Tor, built with static binaries and no OS layer.',
    tags: ['Docker', 'Actions'],
    links: [{ name: 'Source', url: 'https://github.com/h3nc4/tor-slim', icon: SiGithub }],
  },
  {
    title: 'nginx-slim',
    description:
      'A single binary NGINX Docker container, built with static binaries and no OS layer.',
    tags: ['Docker', 'Actions'],
    links: [{ name: 'Source', url: 'https://github.com/h3nc4/nginx-slim', icon: SiGithub }],
  },
]
