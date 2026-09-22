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
import { FeaturedProject } from '@/components/sections/FeaturedProject'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { ProjectFamilies } from '@/components/sections/ProjectFamilies'
import { SelectedProjects } from '@/components/sections/SelectedProjects'

/**
 * Main application component acting as the layout shell.
 * The hero sits directly on the painting, and every section below it gets a
 * panel, because content over a photograph needs its own ground to remain legible.
 */
export default function App() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        {/* Top section, hero plus featured */}
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">
          {/* Left column, hero plus project info */}
          <main className="flex flex-col space-y-14 lg:w-1/2 lg:py-10">
            <Hero />

            {/* Visual Divider */}
            <AnimatedContent distance={20} direction="vertical" delay={0.2}>
              <hr
                className="via-dawn-stone lg:from-dawn-stone lg:via-dawn-stone h-px w-full border-0 bg-linear-to-r from-transparent to-transparent"
                aria-hidden="true"
              />
            </AnimatedContent>

            <FeaturedProject delay={0.4} />
          </main>

          {/* Right column, device frame */}
          <aside className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
            <div className="w-full max-w-md lg:sticky lg:top-24">
              <AnimatedContent distance={40} direction="horizontal" delay={0.6}>
                <DeviceFrame src="https://wasudoku.h3nc4.com" title="WASudoku Live Preview" />
              </AnimatedContent>
            </div>
          </aside>
        </div>

        <div className="panel mt-24 p-6 sm:p-9 lg:mt-32 lg:p-11">
          <SelectedProjects />
        </div>

        <div className="panel mt-8 p-6 sm:p-9 lg:p-11">
          <ProjectFamilies />
        </div>

        <Footer />
      </div>
    </div>
  )
}
