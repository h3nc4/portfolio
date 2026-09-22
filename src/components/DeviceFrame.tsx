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

import type { CSSProperties } from 'react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DeviceFrameProps {
  readonly src: string
  readonly title: string
  readonly className?: string
  /**
   * Scales the content inside the frame.
   * Values < 1 "zoom out", allowing more content to fit.
   * Default: 0.8
   */
  readonly zoom?: number
  /**
   * The same, for viewports under 640px, where the frame is far narrower.
   * Default: 0.72
   */
  readonly mobileZoom?: number
  /**
   * The same, from 1024px up, where the frame reaches its full width.
   * Default: 0.8
   */
  readonly largeZoom?: number
}

/**
 * Shows interactive content in an iframe inside a handset mock.
 * The greys are neutral on purpose. The phone then reads as an object on the
 * page rather than as part of the palette.
 */
export function DeviceFrame({
  src,
  title,
  className,
  zoom = 0.8,
  mobileZoom = 0.72,
  largeZoom = 0.8,
}: DeviceFrameProps) {
  return (
    <div
      className={cn('relative mx-auto w-full max-w-90', className)}
      data-testid="device-frame-container"
    >
      {/* Live Badge Indicator */}
      <div className="absolute -top-12 right-0 left-0 z-20 flex justify-center">
        <Badge
          variant="outline"
          className="border-dawn-line bg-dawn-ground/80 text-dawn-taupe gap-2 py-1.5 font-mono text-xs shadow-xl backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="bg-dawn-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
            <span className="bg-dawn-accent-hi relative inline-flex h-2 w-2 rounded-full"></span>
          </span>
          <span>Live Interactive Preview</span>
        </Badge>
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

          {/* Screen */}
          <div className="device-screen relative aspect-9/19 w-full overflow-hidden rounded-[1.7rem] bg-black">
            <iframe
              src={src}
              title={title}
              className="border-0 bg-black"
              style={
                {
                  '--device-zoom': zoom,
                  '--device-zoom-sm': mobileZoom,
                  '--device-zoom-lg': largeZoom,
                } as CSSProperties
              }
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Home bar on the chin */}
          <div className="mx-auto mt-[11px] h-[4px] w-24 rounded-full bg-neutral-700" />
        </div>
      </div>
    </div>
  )
}
