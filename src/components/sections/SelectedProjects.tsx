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

import AnimatedContent from '@/components/AnimatedContent'
import { TerminalDemo } from '@/components/TerminalDemo'
import { Badge } from '@/components/ui/badge'
import { DEMO_PROJECTS, SELECTED_PROJECTS } from '@/data/projects'

/**
 * Renders the main projects as a card grid, one card per domain.
 * The sixth cell is a terminal demo rather than a project, which keeps the
 * simulation on the page and fills the grid instead of leaving a gap.
 */
export function SelectedProjects() {
  const demo = DEMO_PROJECTS[0]

  return (
    <section>
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="bg-dawn-stone h-px w-12" />
          <h2 className="text-dawn-cream text-2xl font-medium tracking-tight">Selected Projects</h2>
          <span className="bg-dawn-line h-px flex-1" />
        </div>
        <p className="text-dawn-taupe mb-8 max-w-prose font-light">
          A distribution, a phone gesture layer, a Go service, a C daemon, and the tooling that
          grades the rest.
        </p>
      </AnimatedContent>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SELECTED_PROJECTS.map((project, index) => (
          <AnimatedContent
            key={project.title}
            distance={20}
            direction="vertical"
            delay={0.1 * index}
            threshold={0.1}
            className="h-full"
          >
            <a
              href={project.links[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-dawn-line bg-dawn-surface hover:border-dawn-accent flex h-full flex-col rounded-xl border p-6 transition-all hover:-translate-y-0.5"
            >
              <h3 className="text-dawn-cream text-lg font-medium">{project.title}</h3>
              <p className="text-dawn-stone mt-1 font-mono text-xs tracking-wider uppercase">
                {project.language}
              </p>
              <p className="text-dawn-taupe mt-4 mb-auto text-sm leading-relaxed font-light">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-dawn-line text-dawn-sand font-mono text-xs font-normal"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </a>
          </AnimatedContent>
        ))}

        <AnimatedContent
          distance={20}
          direction="vertical"
          delay={0.5}
          threshold={0.1}
          className="h-full"
        >
          <div className="border-dawn-line flex h-full flex-col rounded-xl border bg-[#17120e]/80 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-dawn-stone font-mono text-xs tracking-wider uppercase">
                {demo.title}
              </span>
              <a
                href={demo.links[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dawn-taupe hover:text-dawn-accent font-mono text-xs tracking-wider uppercase transition-colors"
              >
                {demo.links[0].name}
              </a>
            </div>
            <TerminalDemo script={demo.demo} />
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}
