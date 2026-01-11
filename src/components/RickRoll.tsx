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

export const RICK_ROLL_URL = 'https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.mp4'

// Preload the video asset to prevent stuttering.
// This side effect runs once when the module is imported.
if (globalThis.window !== undefined) {
  const preloader = document.createElement('video')
  preloader.preload = 'auto'
  preloader.src = RICK_ROLL_URL
  preloader.muted = true
  preloader.load()
}

export function RickRoll() {
  return (
    <div className="w-[50%] overflow-hidden rounded-md" data-testid="rick-roll-container">
      <div className="relative w-full pb-[83%]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={RICK_ROLL_URL} type="video/mp4" />
        </video>
      </div>
    </div>
  )
}
