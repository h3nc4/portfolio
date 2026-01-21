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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MINOR_PROJECTS } from '@/data/projects'

/**
 * Renders a grid of secondary projects using cards.
 * Loads project data from a static configuration.
 * Includes terminal simulations for CLI tools.
 */
export function MinorProjects() {
  return (
    <section className="mt-24 lg:mt-32">
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-12 flex items-center gap-4">
          <span className="h-px w-12 bg-zinc-700" />
          <h2 className="text-2xl font-bold text-zinc-100">Other Projects</h2>
          <span className="h-px flex-1 bg-zinc-700" />
        </div>
      </AnimatedContent>

      <div className="flex flex-wrap justify-center gap-8">
        {MINOR_PROJECTS.map((project, index) => (
          <AnimatedContent
            key={project.title}
            distance={20}
            direction="vertical"
            delay={0.1 * index}
            threshold={0.1}
            className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]"
          >
            <Card className="flex h-full flex-col overflow-hidden border-zinc-800 bg-zinc-900/40 text-zinc-100 transition-colors hover:border-zinc-600">
              {/* Terminal Demo Section (Top) */}
              {project.demo && (
                <div className="border-b border-zinc-800 bg-black/20 p-4">
                  <TerminalDemo script={project.demo} />
                </div>
              )}

              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  {project.title}
                </CardTitle>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <CardDescription className="text-sm leading-relaxed text-zinc-400">
                  {project.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex gap-4">
                  {project.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-medium tracking-wider text-zinc-500 uppercase transition-colors hover:text-white"
                    >
                      <link.icon className="h-3.5 w-3.5" />
                      {link.name}
                    </a>
                  ))}
                </div>
              </CardFooter>
            </Card>
          </AnimatedContent>
        ))}
      </div>
    </section>
  )
}
