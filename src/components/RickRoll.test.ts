// @vitest-environment node
import { within } from '@testing-library/dom'

import RickRoll, { RICK_ROLL_URL } from '@/components/RickRoll.astro'
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
