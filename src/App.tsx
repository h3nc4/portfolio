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

import { ExternalLink, Mail } from 'lucide-react'
import { SiGithub, SiLinkedin } from 'react-icons/si'

import { DarkVeil } from '@/components/DarkVeil'
import { DeviceFrame } from '@/components/DeviceFrame'
import { Button } from '@/components/ui/button'

export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white">
      {/* Background Effect */}
      <DarkVeil
        className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
        speed={0.4}
        noiseIntensity={0}
        scanlineFrequency={0.5}
        scanlineIntensity={0}
      />

      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-12 lg:flex-row lg:items-center lg:gap-20 lg:py-0">
        {/* Left Column: Content (Hero + Project Info) */}
        <main className="flex flex-col space-y-16 lg:w-1/2 lg:py-20">
          {/* Hero Section */}
          <section className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="bg-linear-to-b from-white to-white/60 bg-clip-text text-5xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-7xl">
                Henrique Almeida
              </h1>
              <p className="mx-auto text-xl leading-relaxed text-zinc-300 lg:mx-0">
                Software & DevOps Engineer passionate about free software and the GNU/Linux
                ecosystem along with the UNIX philosophy.
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

          {/* Visual Divider */}
          <hr
            className="h-px w-full border-0 bg-linear-to-r from-transparent via-zinc-700 to-transparent lg:from-zinc-700 lg:via-zinc-700 lg:to-transparent"
            aria-hidden="true"
          />

          {/* Featured Project Section */}
          <section className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-zinc-400 lg:justify-start">
                <span className="h-px w-8 bg-zinc-700" />
                <span className="text-sm font-medium tracking-wider uppercase">
                  Featured Project
                </span>
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
                <a
                  href="https://github.com/h3nc4/WASudoku"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiGithub className="h-4 w-4" />
                  Source Code
                </a>
              </Button>
            </div>
          </section>

          {/* Footer */}
          <footer className="pt-8 text-center text-sm text-zinc-400 lg:text-left">
            <p>© 2026 Henrique Almeida.</p>
          </footer>
        </main>

        {/* Right Column: Device Frame */}
        <aside className="relative mt-12 flex w-full justify-center lg:mt-0 lg:w-1/2 lg:justify-end">
          <div className="w-full max-w-md lg:sticky lg:top-12">
            <DeviceFrame src="https://wasudoku.h3nc4.com" title="WASudoku Live Preview" />
          </div>
        </aside>
      </div>
    </div>
  )
}
