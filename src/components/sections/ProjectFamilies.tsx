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
import { EXTRAS, FAMILIES } from '@/data/projects'

/**
 * Lists the repository groups that share one idea, compactly.
 * A card each would repeat the same sentence. Each family is a column of rows.
 */
export function ProjectFamilies() {
  return (
    <section>
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="bg-dawn-stone h-px w-12" />
          <h2 className="text-dawn-cream text-2xl font-medium tracking-tight">
            Repository Families
          </h2>
          <span className="bg-dawn-line h-px flex-1" />
        </div>
        <p className="text-dawn-taupe mb-8 max-w-prose font-light">
          Each family is one idea repeated for a different goal.
        </p>
      </AnimatedContent>

      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-11">
        {FAMILIES.map((family, index) => (
          <AnimatedContent
            key={family.name}
            distance={20}
            direction="vertical"
            delay={0.1 * index}
            threshold={0.1}
          >
            <h3 className="border-dawn-cream/15 text-dawn-stone mb-3 border-b pb-3 font-mono text-xs tracking-wider uppercase">
              {family.name}
            </h3>
            {family.items.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-4 py-2.5 text-sm transition-colors"
              >
                <span className="text-dawn-sand group-hover:text-dawn-accent font-mono text-sm transition-colors">
                  {item.title}
                </span>
                <span className="text-dawn-stone text-right text-sm font-light">{item.what}</span>
              </a>
            ))}
          </AnimatedContent>
        ))}
      </div>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <div className="mt-10 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="text-dawn-stone font-mono text-xs tracking-wider uppercase">
            Smaller things
          </span>
          {EXTRAS.map((extra) => (
            <a
              key={extra.title}
              href={extra.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dawn-taupe hover:text-dawn-accent text-sm font-light transition-colors"
            >
              {extra.title}
            </a>
          ))}
          <a
            href="https://cgit.h3nc4.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dawn-taupe hover:text-dawn-accent text-sm font-light transition-colors"
          >
            all of it on cgit
          </a>
        </div>
      </AnimatedContent>
    </section>
  )
}
