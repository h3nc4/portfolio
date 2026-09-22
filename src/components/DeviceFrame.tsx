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

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DeviceFrameProps {
  readonly src: string
  readonly title: string
  readonly className?: string
  /**
   * Scales the content inside the frame.
   * Values < 1 "zoom out", allowing more content to fit.
   * Default: 0.85
   */
  readonly zoom?: number
}

/**
 * A container component that simulates a mobile device frame
 * to display interactive content via an iframe.
 *
 * It uses a fixed aspect ratio (9/19) typical of modern smartphones
 * and applies a zoom-out effect to the iframe content to prevent
 * scrolling and show more of the app UI.
 */
export function DeviceFrame({ src, title, className, zoom = 0.85 }: DeviceFrameProps) {
  // Calculate inverse scale percentage for width/height
  // e.g. zoom 0.5 -> width 200%, then scaled down by 0.5 -> visual width 100%
  const dimensionScale = (1 / zoom) * 100

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

      {/* Device Frame */}
      <div className="border-dawn-line bg-dawn-ground relative aspect-9/19 w-full overflow-hidden rounded-[2.5rem] border-8 shadow-2xl md:border-10">
        <iframe
          src={src}
          title={title}
          className="bg-dawn-ground border-0"
          style={{
            width: `${dimensionScale}%`,
            height: `${dimensionScale}%`,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
          }}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
