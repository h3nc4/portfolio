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

import { useState } from 'react'

import gestureSettingsSmall from '@/assets/hypergesture/gesture-settings-360.webp'
import gestureSettingsLarge from '@/assets/hypergesture/gesture-settings-720.webp'
import homeSmall from '@/assets/hypergesture/home-360.webp'
import homeLarge from '@/assets/hypergesture/home-720.webp'
import setupSmall from '@/assets/hypergesture/setup-360.webp'
import setupLarge from '@/assets/hypergesture/setup-720.webp'
import { PhoneShell } from '@/components/PhoneShell'
import { useSwipe } from '@/hooks/useSwipe'
import { cn } from '@/lib/utils'

/** Pixel size of the narrower export, which the larger one doubles. */
const SHOT_WIDTH = 360
const SHOT_HEIGHT = 757
const SHOT_SIZES = '(min-width: 416px) 294px, calc(100vw - 122px)'

interface Screen {
  readonly name: string
  readonly alt: string
  readonly small: string
  readonly large: string
}

const HYPERGESTURE_SCREENS: readonly Screen[] = [
  {
    name: 'Home',
    alt: 'HyperGesture home screen in dark theme, showing gestures on, with toggles for app switching and Circle to Search.',
    small: homeSmall,
    large: homeLarge,
  },
  {
    name: 'Gestures',
    alt: 'Gesture settings in dark theme, listing back, home and recents gestures above sliders for edge width and swipe distance.',
    small: gestureSettingsSmall,
    large: gestureSettingsLarge,
  },
  {
    name: 'Setup',
    alt: 'HyperGesture setup checklist in dark theme, with restricted settings and accessibility marked done and battery restrictions left to check.',
    small: setupSmall,
    large: setupLarge,
  },
]

// App screenshots in a handset, picked from the pill above it or by a tap or swipe.
// Screens are stacked and swapped by opacity, which keeps a fetch out of a switch.
export function HyperGesturePreview() {
  const [active, setActive] = useState(0)
  const count = HYPERGESTURE_SCREENS.length
  const next = () => setActive((index) => (index + 1) % count)
  const previous = () => setActive((index) => (index - 1 + count) % count)
  const swipe = useSwipe({ onTap: next, onSwipeLeft: next, onSwipeRight: previous })

  const switcher = (
    <div role="group" aria-label="HyperGesture app screens" className="flex p-0.5">
      {HYPERGESTURE_SCREENS.map((screen, index) => (
        <button
          key={screen.name}
          type="button"
          aria-pressed={index === active}
          onClick={() => setActive(index)}
          className={cn(
            'focus-visible:ring-dawn-accent/60 rounded-full px-2.5 py-1 transition-colors outline-none focus-visible:ring-2',
            index === active
              ? 'bg-dawn-cream/10 text-dawn-accent'
              : 'hover:text-dawn-cream text-dawn-taupe',
          )}
        >
          {screen.name}
        </button>
      ))}
    </div>
  )

  return (
    <PhoneShell badge={switcher}>
      {HYPERGESTURE_SCREENS.map((screen, index) => (
        <img
          key={screen.name}
          src={screen.small}
          srcSet={`${screen.small} ${SHOT_WIDTH}w, ${screen.large} ${SHOT_WIDTH * 2}w`}
          sizes={SHOT_SIZES}
          width={SHOT_WIDTH}
          height={SHOT_HEIGHT}
          alt={screen.alt}
          aria-hidden={index !== active}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            // Contained at the top, with the app's own background filling the taller screen below
            'absolute inset-0 h-full w-full bg-[#0f151c] object-contain object-top transition-opacity duration-300',
            index === active ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}

      <button
        type="button"
        aria-label="Next app screen"
        className="focus-visible:ring-dawn-accent/60 absolute inset-0 cursor-pointer touch-pan-y outline-none select-none focus-visible:ring-2 focus-visible:ring-inset"
        {...swipe}
      />
    </PhoneShell>
  )
}
