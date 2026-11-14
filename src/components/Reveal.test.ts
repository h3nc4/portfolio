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
import Reveal from '@/components/Reveal.astro'
import { render } from '@/test/astro'

async function reveal(props: Record<string, unknown> = {}) {
  const body = await render(Reveal, { props, slots: { default: '<p>Inside</p>' } })
  return body.querySelector<HTMLElement>('.reveal')!
}

describe('Reveal', () => {
  it('wraps its content in a reveal block', async () => {
    const block = await reveal({ class: 'extra' })

    expect(block).toHaveClass('reveal', 'extra')
    expect(block).toContainHTML('<p>Inside</p>')
  })

  it('writes no delay or threshold at the defaults', async () => {
    const block = await reveal({ delay: 0, threshold: 0.1 })

    expect(block).not.toHaveAttribute('data-delay')
    expect(block).not.toHaveAttribute('data-threshold')
  })

  it('writes neither when given no props', async () => {
    const block = await reveal()

    expect(block).not.toHaveAttribute('data-delay')
    expect(block).not.toHaveAttribute('data-threshold')
  })

  it('writes a delay above zero, rounded to the millisecond', async () => {
    expect(await reveal({ delay: 0.2 })).toHaveAttribute('data-delay', '0.2')
    expect(await reveal({ delay: 0.1 * 3 })).toHaveAttribute('data-delay', '0.3')
  })

  it('writes a threshold that differs from the default', async () => {
    expect(await reveal({ threshold: 0.2 })).toHaveAttribute('data-threshold', '0.2')
    expect(await reveal({ threshold: 0 })).toHaveAttribute('data-threshold', '0')
  })
})
