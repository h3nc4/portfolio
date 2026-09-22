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
    <section className="mt-24 lg:mt-32">
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="h-px w-12 bg-zinc-700" />
          <h2 className="text-2xl font-bold text-zinc-100">Selected Projects</h2>
          <span className="h-px flex-1 bg-zinc-700" />
        </div>
        <p className="mb-8 max-w-prose text-zinc-400">
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
              className="flex h-full flex-col rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all hover:-translate-y-0.5 hover:border-zinc-600"
            >
              <h3 className="text-lg font-semibold text-zinc-100">{project.title}</h3>
              <p className="mt-1 text-xs font-medium tracking-wider text-zinc-500 uppercase">
                {project.language}
              </p>
              <p className="mt-4 mb-auto text-sm leading-relaxed text-zinc-400">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-zinc-800 text-zinc-300">
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
          <div className="flex h-full flex-col rounded-xl border border-zinc-800 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
                {demo.title}
              </span>
              <a
                href={demo.links[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
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
