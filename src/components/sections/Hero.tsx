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

import { Mail } from 'lucide-react'
import { SiGithub, SiLinkedin } from 'react-icons/si'

import AnimatedContent from '@/components/AnimatedContent'
import { Button } from '@/components/ui/button'

interface HeroProps {
  /**
   * Delay in seconds before the animation starts.
   * @default 0
   */
  readonly delay?: number
}

/**
 * Hero section displaying the introduction, role, and social action buttons.
 */
export function Hero({ delay = 0 }: HeroProps) {
  return (
    <AnimatedContent distance={20} direction="vertical" delay={delay}>
      <section className="space-y-8 text-center lg:text-left">
        <div className="space-y-4">
          <h1 className="bg-linear-to-b from-white to-white/60 bg-clip-text text-5xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl">
            Henrique Almeida
          </h1>
          <p className="mx-auto text-xl leading-relaxed text-zinc-300 lg:mx-0">
            Software & DevOps Engineer passionate about free software and the GNU/Linux ecosystem
            along with the UNIX philosophy.
          </p>
        </div>

        <div className="flex justify-center gap-4 lg:justify-start">
          <Button
            variant="outline"
            className="gap-2 border-zinc-800 bg-black/50 hover:bg-zinc-900"
            asChild
          >
            <a href="https://github.com/h3nc4" target="_blank" rel="noopener noreferrer">
              <SiGithub className="h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Button
            variant="outline"
            className="gap-2 border-zinc-800 bg-black/50 hover:bg-zinc-900"
            asChild
          >
            <a href="https://linkedin.com/in/h3nc4" target="_blank" rel="noopener noreferrer">
              <SiLinkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </Button>
          <Button className="gap-2 bg-white text-black hover:bg-zinc-200" asChild>
            <a href="mailto:me@h3nc4.com">
              <Mail className="h-4 w-4" />
              Contact Me
            </a>
          </Button>
        </div>
      </section>
    </AnimatedContent>
  )
}
