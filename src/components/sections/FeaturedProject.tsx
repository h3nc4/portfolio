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

import { ExternalLink, GitBranch } from 'lucide-react'
import { SiGithub } from 'react-icons/si'

import AnimatedContent from '@/components/AnimatedContent'
import { Button } from '@/components/ui/button'

interface FeaturedProjectProps {
  /**
   * Delay in seconds before the animation starts.
   * @default 0
   */
  readonly delay?: number
}

/**
 * Displays detailed information about the featured project (WASudoku).
 */
export function FeaturedProject({ delay = 0 }: FeaturedProjectProps) {
  return (
    <AnimatedContent distance={20} direction="vertical" delay={delay}>
      <section className="space-y-8 text-center lg:text-left">
        <div className="space-y-4">
          <div className="text-dawn-accent flex items-center justify-center gap-2 font-mono lg:justify-start">
            <span className="bg-dawn-stone h-px w-8" />
            <span className="text-sm font-medium tracking-wider uppercase">Featured Project</span>
            <span className="bg-dawn-stone hidden h-px w-8" />
          </div>

          <h2 className="text-dawn-cream text-3xl font-medium tracking-tight">WASudoku</h2>
          <p className="text-dawn-stone font-mono text-sm tracking-wide">Vite / Rust / TS / PWA</p>

          <p className="text-dawn-taupe mx-auto text-lg leading-relaxed font-light lg:mx-0">
            A high-performance Sudoku solver and generator running entirely in the browser using
            WebAssembly and Rust. Features a hybrid solving engine (logic + backtracking),
            step-by-step visualization, and a responsive PWA interface.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
          <Button
            className="bg-dawn-accent text-dawn-ground hover:bg-dawn-accent-hi gap-2 font-medium"
            asChild
          >
            <a href="https://wasudoku.h3nc4.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open App
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-dawn-cream/30 bg-dawn-ground/55 hover:border-dawn-accent hover:text-dawn-accent gap-2 backdrop-blur-sm"
            asChild
          >
            <a href="https://github.com/h3nc4/WASudoku" target="_blank" rel="noopener noreferrer">
              <SiGithub className="h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-dawn-cream/30 bg-dawn-ground/55 hover:border-dawn-accent hover:text-dawn-accent gap-2 backdrop-blur-sm"
            asChild
          >
            <a href="https://cgit.h3nc4.com/WASudoku" target="_blank" rel="noopener noreferrer">
              <GitBranch className="h-4 w-4" />
              cgit
            </a>
          </Button>
        </div>
      </section>
    </AnimatedContent>
  )
}
