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
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DarkVeil } from './DarkVeil'

const { MockRenderer, MockProgram, MockMesh, MockTriangle, MockVec2 } = vi.hoisted(() => {
  return {
    MockRenderer: vi.fn(function () {
      return {
        gl: {},
        setSize: vi.fn(),
        render: vi.fn(),
      }
    }),
    MockProgram: vi.fn(function () {
      return {
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: { set: vi.fn() } },
          uHueShift: { value: 0 },
          uNoise: { value: 0 },
          uScan: { value: 0 },
          uScanFreq: { value: 0 },
          uWarp: { value: 0 },
        },
      }
    }),
    MockMesh: vi.fn(),
    MockTriangle: vi.fn(),
    MockVec2: vi.fn(function () {
      return {
        set: vi.fn(),
      }
    }),
  }
})

vi.mock('ogl', () => {
  return {
    Renderer: MockRenderer,
    Program: MockProgram,
    Mesh: MockMesh,
    Triangle: MockTriangle,
    Vec2: MockVec2,
  }
})

describe('DarkVeil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders canvas element within container', () => {
    render(<DarkVeil />)
    const container = screen.getByTestId('dark-veil-container')
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('block h-full w-full')
    expect(container).toHaveAttribute('aria-hidden', 'true')

    const canvas = container.querySelector('canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveClass('block h-full w-full')
  })

  it('applies custom className to container', () => {
    render(<DarkVeil className="fixed inset-0" />)
    const container = screen.getByTestId('dark-veil-container')
    expect(container).toHaveClass('fixed inset-0')
  })

  it('handles missing parentElement gracefully', () => {
    // Mock parentElement getter to return null for the inner canvas
    const originalGetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'parentElement')
    Object.defineProperty(HTMLElement.prototype, 'parentElement', {
      get: function () {
        // Return null only for the test canvas
        if (this.tagName === 'CANVAS') {
          return null
        }
        return this.parentNode
      },
      configurable: true,
    })

    // Should not throw
    render(<DarkVeil />)

    // Ensure the effect triggered the early return by checking that Renderer was NOT instantiated
    expect(MockRenderer).not.toHaveBeenCalled()

    // Cleanup
    if (originalGetter) {
      Object.defineProperty(HTMLElement.prototype, 'parentElement', originalGetter)
    }
  })
})
