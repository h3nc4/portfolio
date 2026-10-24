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

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface PhoneShellProps {
  /** Content of the pill above the handset, which draws the pill itself. */
  readonly badge: ReactNode
  readonly screenClassName?: string
  readonly className?: string
  readonly children: ReactNode
}

/** A handset mock in neutral greys, so it reads as an object rather than part of the palette. */
export function PhoneShell({ badge, screenClassName, className, children }: PhoneShellProps) {
  return (
    // One cap for every handset, so phones shown side by side share a scale
    <div
      className={cn('relative mx-auto w-full max-w-80', className)}
      data-testid="device-frame-container"
    >
      {/* One pill frame for every badge, so pills side by side share a height */}
      <div className="absolute -top-12 right-0 left-0 z-20 flex justify-center">
        <div
          data-testid="phone-badge"
          className="border-dawn-line bg-dawn-ground/80 text-dawn-taupe inline-flex items-center rounded-full border font-mono text-xs whitespace-nowrap shadow-xl backdrop-blur-md"
        >
          {badge}
        </div>
      </div>

      {/* Outer shell, a hairline lighter than the body so the edge catches light */}
      <div className="relative rounded-[2.6rem] bg-linear-to-b from-neutral-500 to-neutral-700 p-[3px] shadow-2xl">
        {/* Body, the grey bezel with a wider chin below the screen */}
        <div className="rounded-[2.45rem] bg-neutral-900 px-[10px] pt-[26px] pb-[20px]">
          {/* Earpiece and camera */}
          <div className="absolute top-[13px] right-0 left-0 flex items-center justify-center gap-2">
            <span className="h-[4px] w-10 rounded-full bg-neutral-800" />
            <span className="flex h-[8px] w-[8px] items-center justify-center rounded-full bg-neutral-950 ring-1 ring-neutral-700">
              <span className="h-[3px] w-[3px] rounded-full bg-neutral-600" />
            </span>
          </div>

          <div
            className={cn(
              'relative aspect-9/21 w-full overflow-hidden rounded-[1.7rem] bg-black',
              screenClassName,
            )}
          >
            {children}
          </div>

          {/* Home bar on the chin */}
          <div className="mx-auto mt-[11px] h-[4px] w-24 rounded-full bg-neutral-700" />
        </div>
      </div>
    </div>
  )
}
