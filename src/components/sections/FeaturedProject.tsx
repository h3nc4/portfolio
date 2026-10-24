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

import type { ReactNode } from 'react'

import AnimatedContent from '@/components/AnimatedContent'
import { Button } from '@/components/ui/button'
import type { FeaturedLink, FeaturedProjectData } from '@/data/featured'

interface FeaturedProjectProps {
  readonly project: FeaturedProjectData
  /** The handset that previews the project, drawn above its text. */
  readonly preview: ReactNode
  /**
   * Delay in seconds before the text animates in.
   * @default 0
   */
  readonly delay?: number
}

const PRIMARY_CLASS = 'bg-dawn-accent text-dawn-ground hover:bg-dawn-accent-hi gap-2 font-medium'
const SECONDARY_CLASS =
  'border-dawn-cream/30 bg-dawn-ground/55 hover:border-dawn-accent hover:text-dawn-accent gap-2 backdrop-blur-sm'

function ProjectLink({
  link,
  primary,
}: {
  readonly link: FeaturedLink
  readonly primary: boolean
}) {
  const Icon = link.icon
  const newTab = link.sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' }

  return (
    <Button
      variant={primary ? 'default' : 'outline'}
      className={primary ? PRIMARY_CLASS : SECONDARY_CLASS}
      asChild
    >
      <a href={link.href} aria-label={link.ariaLabel} {...newTab}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {link.label}
      </a>
    </Button>
  )
}

/** One featured column, a subgrid on wide screens so both phones and both titles line up. */
export function FeaturedProject({ project, preview, delay = 0 }: FeaturedProjectProps) {
  return (
    <article
      id={project.id}
      className="flex scroll-mt-8 flex-col gap-10 lg:row-span-2 lg:grid lg:grid-rows-subgrid"
    >
      {/* Room for the badge above the handset */}
      <div className="pt-12">{preview}</div>

      <AnimatedContent
        distance={20}
        direction="vertical"
        delay={delay}
        className="flex flex-col items-center text-center"
      >
        <h3 className="text-dawn-cream text-2xl font-medium tracking-tight">{project.title}</h3>
        <p className="text-dawn-stone mt-2 font-mono text-sm tracking-wide">{project.stack}</p>

        <p className="text-dawn-taupe mt-4 max-w-md leading-relaxed font-light">
          {project.description}
        </p>

        <div className="mt-auto flex flex-wrap justify-center gap-3 pt-8">
          {project.links.map((link, index) => (
            <ProjectLink key={link.label} link={link} primary={index === 0} />
          ))}
        </div>
      </AnimatedContent>
    </article>
  )
}
