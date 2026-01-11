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
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import * as React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AnimatedContent from './AnimatedContent'

// Mock React to allow spying on useRef
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof React>()
  return {
    ...actual,
    useRef: vi.fn(actual.useRef),
  }
})

// Mock GSAP and ScrollTrigger
vi.mock('gsap', () => {
  return {
    gsap: {
      registerPlugin: vi.fn(),
      set: vi.fn(),
      to: vi.fn(),
      timeline: vi.fn(),
    },
  }
})

vi.mock('gsap/ScrollTrigger', () => {
  return {
    ScrollTrigger: {
      create: vi.fn(),
    },
  }
})

describe('AnimatedContent', () => {
  const mockTimelineInstance = {
    to: vi.fn().mockReturnThis(),
    play: vi.fn(),
    kill: vi.fn(),
  }

  const mockScrollTriggerInstance = {
    kill: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    // Default mock implementations
    vi.mocked(gsap.timeline).mockReturnValue(mockTimelineInstance as unknown as gsap.core.Timeline)
    vi.mocked(ScrollTrigger.create).mockReturnValue(
      mockScrollTriggerInstance as unknown as ScrollTrigger,
    )
    // Reset useRef to original implementation by default
    const actualReact = await vi.importActual<typeof React>('react')
    vi.mocked(React.useRef).mockImplementation(actualReact.useRef)
  })

  it('renders children', () => {
    render(<AnimatedContent>Test Content</AnimatedContent>)
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('initializes GSAP with default vertical settings', () => {
    render(<AnimatedContent>Test Content</AnimatedContent>)

    // Verify gsap.set was called to setup initial state
    // Default: distance=100, direction='vertical' (y), reverse=false
    expect(gsap.set).toHaveBeenCalledWith(expect.any(HTMLElement), {
      y: 100,
      scale: 1,
      opacity: 0, // default initialOpacity=0
      visibility: 'visible',
    })

    // Verify timeline creation
    expect(gsap.timeline).toHaveBeenCalledWith(
      expect.objectContaining({
        paused: true,
        delay: 0,
      }),
    )

    // Verify animation definition
    expect(mockTimelineInstance.to).toHaveBeenCalledWith(expect.any(HTMLElement), {
      y: 0,
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
    })
  })

  it('initializes GSAP with horizontal reverse settings', () => {
    render(
      <AnimatedContent direction="horizontal" reverse distance={200} initialOpacity={0.5}>
        Test Content
      </AnimatedContent>,
    )

    // direction='horizontal' -> x
    // reverse=true -> offset = -distance = -200
    expect(gsap.set).toHaveBeenCalledWith(expect.any(HTMLElement), {
      x: -200,
      scale: 1,
      opacity: 0.5,
      visibility: 'visible',
    })

    expect(mockTimelineInstance.to).toHaveBeenCalledWith(expect.any(HTMLElement), {
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 0.8,
      ease: 'power3.out',
    })
  })

  it('respects animateOpacity=false', () => {
    render(
      <AnimatedContent animateOpacity={false} initialOpacity={0}>
        Test Content
      </AnimatedContent>,
    )

    // Should set opacity to 1 immediately if animation is disabled
    expect(gsap.set).toHaveBeenCalledWith(expect.any(HTMLElement), {
      y: 100,
      scale: 1,
      opacity: 1,
      visibility: 'visible',
    })
  })

  it('configures ScrollTrigger correctly with default scroller', () => {
    render(<AnimatedContent threshold={0.5}>Test Content</AnimatedContent>)

    expect(ScrollTrigger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.any(HTMLElement),
        scroller: window, // Default fallback
        start: 'top 50%', // (1 - 0.5) * 100
        once: true,
      }),
    )
  })

  it('resolves container from ID string', () => {
    const container = document.createElement('div')
    container.id = 'test-container'
    document.body.appendChild(container)

    render(<AnimatedContent container="#test-container">Test Content</AnimatedContent>)

    expect(ScrollTrigger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        scroller: container,
      }),
    )

    document.body.removeChild(container)
  })

  it('resolves container from DOM element', () => {
    const container = document.createElement('div')
    render(<AnimatedContent container={container}>Test Content</AnimatedContent>)

    expect(ScrollTrigger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        scroller: container,
      }),
    )
  })

  it('plays timeline on ScrollTrigger enter', () => {
    render(<AnimatedContent>Test Content</AnimatedContent>)

    // Extract the ScrollTrigger config
    const config = vi.mocked(ScrollTrigger.create).mock.calls[0][0] as {
      onEnter: () => void
    }

    // Simulate onEnter
    config.onEnter()

    expect(mockTimelineInstance.play).toHaveBeenCalled()
  })

  it('cleans up GSAP instances on unmount', () => {
    const { unmount } = render(<AnimatedContent>Test Content</AnimatedContent>)

    unmount()

    expect(mockScrollTriggerInstance.kill).toHaveBeenCalled()
    expect(mockTimelineInstance.kill).toHaveBeenCalled()
  })

  it('handles completion callback and disappearance logic', () => {
    const onCompleteSpy = vi.fn()
    const onDisappearanceCompleteSpy = vi.fn()

    render(
      <AnimatedContent
        disappearAfter={1}
        onComplete={onCompleteSpy}
        onDisappearanceComplete={onDisappearanceCompleteSpy}
        direction="vertical"
        reverse={false}
      >
        Test Content
      </AnimatedContent>,
    )

    // Get the timeline config to access onComplete
    const timelineConfig = vi.mocked(gsap.timeline).mock.calls[0][0] as {
      onComplete: () => void
    }

    // Simulate timeline completion
    timelineConfig.onComplete()

    // 1. Check basic onComplete callback
    expect(onCompleteSpy).toHaveBeenCalled()

    // 2. Check disappearance logic (gsap.to called)
    // axis is y (vertical), reverse is false -> target pos is -distance (-100 default)
    expect(gsap.to).toHaveBeenCalledWith(expect.any(HTMLElement), {
      y: -100,
      scale: 0.8,
      opacity: 0,
      delay: 1, // disappearAfter
      duration: 0.5, // default disappearDuration
      ease: 'power3.in',
      onComplete: expect.any(Function),
    })

    // 3. Simulate disappearance completion
    const disappearConfig = vi.mocked(gsap.to).mock.calls[0][1] as {
      onComplete: () => void
    }
    disappearConfig.onComplete()
    expect(onDisappearanceCompleteSpy).toHaveBeenCalled()
  })

  it('handles disappearance logic with reverse=true and animateOpacity=false', () => {
    // This test covers the ternary branches in the disappearance object
    const onDisappearanceCompleteSpy = vi.fn()

    render(
      <AnimatedContent
        disappearAfter={1}
        onDisappearanceComplete={onDisappearanceCompleteSpy}
        direction="vertical"
        reverse={true}
        animateOpacity={false}
        initialOpacity={0.5}
      >
        Test Content
      </AnimatedContent>,
    )

    const timelineConfig = vi.mocked(gsap.timeline).mock.calls[0][0] as {
      onComplete: () => void
    }
    timelineConfig.onComplete()

    // Line 97: [axis]: reverse ? distance : -distance
    // axis='y', reverse=true -> distance (100)
    // Line 99: opacity: animateOpacity ? initialOpacity : 0
    // animateOpacity=false -> 0 (regardless of initialOpacity)
    expect(gsap.to).toHaveBeenCalledWith(expect.any(HTMLElement), {
      y: 100,
      scale: 0.8,
      opacity: 0,
      delay: 1,
      duration: 0.5,
      ease: 'power3.in',
      onComplete: expect.any(Function),
    })
  })

  it('does not trigger disappearance if disappearAfter is 0', () => {
    render(
      <AnimatedContent disappearAfter={0} onComplete={vi.fn()}>
        Test Content
      </AnimatedContent>,
    )

    const timelineConfig = vi.mocked(gsap.timeline).mock.calls[0][0] as {
      onComplete: () => void
    }
    timelineConfig.onComplete()

    // gsap.to should NOT be called for disappearance (it was called for setup in timeline, but not standalone)
    expect(gsap.to).not.toHaveBeenCalled()
  })

  it('handles timeline completion safely without onComplete prop', () => {
    render(<AnimatedContent disappearAfter={1}>Test Content</AnimatedContent>)

    const timelineConfig = vi.mocked(gsap.timeline).mock.calls[0][0] as {
      onComplete: () => void
    }

    // Simulate completion, should not throw even if onComplete is undefined
    expect(() => timelineConfig.onComplete()).not.toThrow()

    // Should still trigger disappearance
    expect(gsap.to).toHaveBeenCalled()
  })

  it('handles disappearance completion safely without onDisappearanceComplete prop', () => {
    render(<AnimatedContent disappearAfter={1}>Test Content</AnimatedContent>)

    const timelineConfig = vi.mocked(gsap.timeline).mock.calls[0][0] as {
      onComplete: () => void
    }
    timelineConfig.onComplete()

    const disappearConfig = vi.mocked(gsap.to).mock.calls[0][1] as {
      onComplete: () => void
    }

    // Simulate disappearance completion, should not throw
    expect(() => disappearConfig.onComplete()).not.toThrow()
  })

  it('returns early if ref is not resolved (defensive check)', () => {
    // Mock useRef to return an object that effectively keeps current as null
    // preventing React from attaching the DOM node
    const nullRef = {
      get current() {
        return null
      },
      set current(_value) {
        // ignore assignment
      },
    }

    vi.mocked(React.useRef).mockReturnValue(nullRef as unknown as React.MutableRefObject<null>)

    render(<AnimatedContent>Test Content</AnimatedContent>)

    // Since ref.current is null, useEffect should return early
    // and gsap.set should NOT be called
    expect(gsap.set).not.toHaveBeenCalled()
  })
})
