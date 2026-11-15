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

// @vitest-environment node
import { within } from '@testing-library/dom'

import RickRoll from '@/components/RickRoll.astro'
import { RICK_ROLL_URL } from '@/lib/terminal'
import { render } from '@/test/astro'

describe('RickRoll', () => {
  it('plays the clip muted, looped and inline', async () => {
    const container = within(await render(RickRoll)).getByTestId('rick-roll-container')
    const video = container.querySelector('video')!

    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveAttribute('muted')
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'auto')

    const source = video.querySelector('source')
    expect(source).toHaveAttribute('src', RICK_ROLL_URL)
    expect(source).toHaveAttribute('type', 'video/mp4')
  })
})
