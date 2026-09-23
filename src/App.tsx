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
import { DeviceFrame } from '@/components/DeviceFrame'
import { ContainerPreviews } from '@/components/sections/ContainerPreviews'
import { FeaturedProject } from '@/components/sections/FeaturedProject'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { Infrastructure } from '@/components/sections/Infrastructure'
import { ProjectFamilies } from '@/components/sections/ProjectFamilies'
import { SelectedProjects } from '@/components/sections/SelectedProjects'
import { useHeroPeek } from '@/hooks/useHeroPeek'

/**
 * Main application component acting as the layout shell.
 * The hero gets a viewport of its own directly on the painting. Everything
 * below it needs a panel of its own, since content over a photograph has no
 * ground of its own to remain legible against.
 */
export default function App() {
  useHeroPeek()

  // clip, not hidden: hidden on one axis makes the other a scroll container
  return (
    <div className="relative min-h-screen w-full overflow-x-clip">
      <div className="mx-auto max-w-7xl px-6">
        <main>
          {/* A full viewport, so scrolling to the top shows the painting uncovered */}
          <section className="hero-pin flex items-center">
            <Hero />
          </section>

          <div className="hero-sheet">
            <div className="panel p-6 sm:p-9 lg:p-11">
              <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
                <div className="lg:w-[52%]">
                  <FeaturedProject />
                </div>

                {/* Device frame, beside the project it previews rather than in a rail */}
                <aside className="relative flex w-full justify-center lg:w-[48%] lg:justify-end">
                  <div className="w-full max-w-md pt-12">
                    <AnimatedContent distance={40} direction="horizontal" delay={0.4}>
                      <DeviceFrame src="https://wasudoku.h3nc4.com" title="WASudoku Live Preview" />
                    </AnimatedContent>
                  </div>
                </aside>
              </div>
            </div>

            <div className="panel mt-8 p-6 sm:p-9 lg:p-11">
              <SelectedProjects />
            </div>

            <div className="panel mt-8 p-6 sm:p-9 lg:p-11">
              <ContainerPreviews />
            </div>

            <div className="panel mt-8 p-6 sm:p-9 lg:p-11">
              <Infrastructure />
            </div>

            <div className="panel mt-8 p-6 sm:p-9 lg:p-11">
              <ProjectFamilies />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
