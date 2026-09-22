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
    <section className="mt-24 lg:mt-32">
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="h-px w-12 bg-zinc-700" />
          <h2 className="text-2xl font-bold text-zinc-100">Repository Families</h2>
          <span className="h-px flex-1 bg-zinc-700" />
        </div>
        <p className="mb-8 max-w-prose text-zinc-400">
          Each family is one idea repeated, so a card for every repository would keep saying the
          same thing.
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
            <h3 className="mb-3 border-b border-zinc-800 pb-3 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
              {family.name}
            </h3>
            {family.items.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-baseline justify-between gap-4 py-2.5 text-sm text-zinc-300 transition-colors hover:text-white"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-right text-sm text-zinc-500">{item.what}</span>
              </a>
            ))}
          </AnimatedContent>
        ))}
      </div>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <div className="mt-10 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Smaller things
          </span>
          {EXTRAS.map((extra) => (
            <a
              key={extra.title}
              href={extra.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {extra.title}
            </a>
          ))}
          <a
            href="https://cgit.h3nc4.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 transition-colors hover:text-white"
          >
            all of it on cgit
          </a>
        </div>
      </AnimatedContent>
    </section>
  )
}
