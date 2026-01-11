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

import { ExternalLink } from 'lucide-react'
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
          <div className="flex items-center justify-center gap-2 text-zinc-100 lg:justify-start">
            <span className="h-px w-8 bg-zinc-700" />
            <span className="text-sm font-medium tracking-wider uppercase">Featured Project</span>
            <span className="hidden h-px w-8 bg-zinc-700" />
          </div>

          <h2 className="text-3xl font-bold text-zinc-100">WASudoku</h2>
          <p className="text-zinc-400">Vite • Rust • TS • PWA</p>

          <p className="mx-auto text-lg leading-relaxed text-zinc-300 lg:mx-0">
            A high-performance Sudoku solver and generator running entirely in the browser using
            WebAssembly and Rust. Features a hybrid solving engine (logic + backtracking),
            step-by-step visualization, and a responsive PWA interface.
          </p>
        </div>

        <div className="flex justify-center gap-4 lg:justify-start">
          <Button className="gap-2 bg-white text-black hover:bg-zinc-200" asChild>
            <a href="https://wasudoku.h3nc4.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open App
            </a>
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-zinc-800 bg-transparent hover:bg-zinc-900"
            asChild
          >
            <a href="https://github.com/h3nc4/WASudoku" target="_blank" rel="noopener noreferrer">
              <SiGithub className="h-4 w-4" />
              Source Code
            </a>
          </Button>
        </div>
      </section>
    </AnimatedContent>
  )
}
