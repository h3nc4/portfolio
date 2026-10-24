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

import { PhoneShell } from '@/components/PhoneShell'

interface DeviceFrameProps {
  readonly src: string
  readonly title: string
  readonly className?: string
  /** Scales the content, so 0.7 hands the app a viewport about 420px wide. */
  readonly zoom?: number
}

/** Shows interactive content in an iframe inside a handset mock. */
export function DeviceFrame({ src, title, className, zoom = 0.7 }: DeviceFrameProps) {
  return (
    <PhoneShell
      badge={
        <span className="flex items-center gap-2 px-2 py-1.5">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span
              data-testid="live-pulse"
              className="bg-dawn-accent absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            />
            <span className="bg-dawn-accent-hi relative inline-flex h-2 w-2 rounded-full" />
          </span>
          Live Interactive Preview
        </span>
      }
      screenClassName="device-screen"
      className={className}
    >
      <iframe
        src={src}
        title={title}
        className="border-0 bg-black"
        style={{ '--device-zoom': zoom } as CSSProperties}
        loading="eager"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </PhoneShell>
  )
}
