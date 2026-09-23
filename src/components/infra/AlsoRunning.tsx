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
 */

import { UNNAMED_BY_MACHINE } from '@/lib/inventory'

/*
 * The rest of what each machine runs. These answer no hostname of their own,
 * so a list of names is the whole of what there is to say about them.
 */
export function AlsoRunning() {
  return (
    <dl data-testid="also-running" className="flex flex-col gap-4">
      {UNNAMED_BY_MACHINE.map((entry) => (
        <div
          key={entry.machine}
          className="border-dawn-cream/10 grid gap-x-6 gap-y-1 border-b pb-4 sm:grid-cols-[8rem_1fr]"
        >
          <dt className="text-dawn-sand font-mono text-[10px] tracking-wider uppercase">
            {entry.machine}
          </dt>
          <dd className="text-dawn-taupe text-[13px] leading-relaxed font-light">
            {entry.names.join(' · ')}
          </dd>
        </div>
      ))}
    </dl>
  )
}
