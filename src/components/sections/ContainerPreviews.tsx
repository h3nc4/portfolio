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
import { CONTAINER_PROJECTS } from '@/data/projects'

/**
 * Renders the slim containers, each above its own terminal output.
 * These images are only legible from what they print on startup. The
 * simulation is the content here rather than an ornament on a card.
 */
export function ContainerPreviews() {
  return (
    <section>
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="bg-dawn-stone h-px w-12" />
          <h2 className="text-dawn-cream text-2xl font-medium tracking-tight">Containers</h2>
          <span className="bg-dawn-cream/15 h-px flex-1" />
        </div>
        <p className="text-dawn-taupe mb-8 max-w-prose font-light">
          One static binary on an empty filesystem. Each image drops the distribution its upstream
          carried but never ran.
        </p>
      </AnimatedContent>

      <div className="flex flex-wrap justify-center gap-6">
        {CONTAINER_PROJECTS.map((project, index) => (
          <AnimatedContent
            key={project.title}
            distance={20}
            direction="vertical"
            delay={0.1 * index}
            threshold={0.1}
            className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
          >
            <a
              href={project.links[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="border-dawn-cream/15 hover:border-dawn-accent flex h-full flex-col overflow-hidden rounded-xl border bg-[#17120e]/55 transition-all hover:-translate-y-0.5"
            >
              <div className="border-dawn-cream/15 border-b bg-[#0c0907]/60 p-4">
                <TerminalDemo script={project.demo} />
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-dawn-cream text-lg font-medium">{project.title}</h3>
                <p className="text-dawn-taupe mt-3 mb-auto text-sm leading-relaxed font-light">
                  {project.description}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-dawn-cream/10 text-dawn-sand font-mono text-xs font-normal"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </a>
          </AnimatedContent>
        ))}
      </div>
    </section>
  )
}
