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
import { DarkVeil } from '@/components/DarkVeil'
import { DeviceFrame } from '@/components/DeviceFrame'
import { FeaturedProject } from '@/components/sections/FeaturedProject'
import { Footer } from '@/components/sections/Footer'
import { Hero } from '@/components/sections/Hero'
import { MinorProjects } from '@/components/sections/MinorProjects'

/**
 * Main application component acting as the layout shell.
 * It orchestrates the positioning of the main sections:
 * - Hero & Featured Project (Left Column)
 * - Device Preview (Right Column, Sticky)
 * - Minor Projects Grid (Bottom)
 */
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

      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        {/* Top Section: Hero + Featured */}
        <div className="flex flex-col gap-16 lg:flex-row lg:items-start lg:gap-20">
          {/* Left Column: Content (Hero + Project Info) */}
          <main className="flex flex-col space-y-16 lg:w-1/2 lg:py-10">
            <Hero />

            {/* Visual Divider */}
            <AnimatedContent distance={20} direction="vertical" delay={0.2}>
              <hr
                className="h-px w-full border-0 bg-linear-to-r from-transparent via-zinc-700 to-transparent lg:from-zinc-700 lg:via-zinc-700 lg:to-transparent"
                aria-hidden="true"
              />
            </AnimatedContent>

            <FeaturedProject delay={0.4} />
          </main>

          {/* Right Column: Device Frame */}
          <aside className="relative flex w-full justify-center lg:w-1/2 lg:justify-end">
            <div className="w-full max-w-md lg:sticky lg:top-24">
              <AnimatedContent distance={40} direction="horizontal" delay={0.6}>
                <DeviceFrame src="https://wasudoku.h3nc4.com" title="WASudoku Live Preview" />
              </AnimatedContent>
            </div>
          </aside>
        </div>

        <MinorProjects />
        <Footer />
      </div>
    </div>
  )
}
