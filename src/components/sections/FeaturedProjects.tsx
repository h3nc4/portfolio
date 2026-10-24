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
import { HyperGesturePreview } from '@/components/HyperGesturePreview'
import { FeaturedProject } from '@/components/sections/FeaturedProject'
import { HYPERGESTURE, WASUDOKU } from '@/data/featured'
import { siblingUrl } from '@/lib/entrance'

/** Text animation stagger between the two columns, in seconds. */
const COLUMN_STAGGER = 0.1

const FEATURED = [
  { project: HYPERGESTURE, preview: <HyperGesturePreview /> },
  {
    project: WASUDOKU,
    preview: <DeviceFrame src={siblingUrl('wasudoku')} title="WASudoku Live Preview" />,
  },
]

/** The featured pair under one heading, side by side on wide screens, HyperGesture first. */
export function FeaturedProjects() {
  return (
    <section>
      <AnimatedContent distance={20} direction="vertical">
        <div className="mb-10 flex items-center gap-4">
          <span className="bg-dawn-stone h-px w-12" />
          <h2 className="text-dawn-cream text-2xl font-medium tracking-tight">Featured Projects</h2>
          <span className="bg-dawn-line h-px flex-1" />
        </div>
      </AnimatedContent>

      <div className="grid gap-16 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-10">
        {FEATURED.map(({ project, preview }, index) => (
          <FeaturedProject
            key={project.id}
            project={project}
            preview={preview}
            delay={COLUMN_STAGGER * index}
          />
        ))}
      </div>
    </section>
  )
}
