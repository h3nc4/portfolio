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

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RICK_ROLL_URL, RickRoll } from './RickRoll'

describe('RickRoll', () => {
  it('renders video with correct attributes', () => {
    render(<RickRoll />)

    // Using querySelector to find the video element since it doesn't have a role or text
    const container = screen.getByTestId('rick-roll-container')
    const video = container.querySelector('video') as HTMLVideoElement

    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('autoplay')
    expect(video).toHaveAttribute('loop')
    expect(video).toHaveProperty('muted', true)
    expect(video).toHaveAttribute('playsinline')
    expect(video).toHaveAttribute('preload', 'auto')

    const source = video.querySelector('source')
    expect(source).toHaveAttribute('src', RICK_ROLL_URL)
    expect(source).toHaveAttribute('type', 'video/mp4')
  })
})
