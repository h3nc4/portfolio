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

import ContainerPreviews from '@/components/sections/ContainerPreviews.astro'
import { CONTAINER_PROJECTS } from '@/data/projects'
import { render } from '@/test/astro'

const RICK_ROLLER = 'yt-dlp-slim'

async function section() {
  return render(ContainerPreviews)
}

describe('ContainerPreviews', () => {
  it('renders the section header and intro', async () => {
    const body = await section()

    expect(within(body).getByRole('heading', { name: 'Containers', level: 2 })).toBeInTheDocument()
    expect(within(body).getByText(/One static binary on an empty filesystem/)).toBeInTheDocument()
  })

  it('renders a card per container', async () => {
    const body = await section()

    expect(within(body).getAllByRole('heading', { level: 3 })).toHaveLength(
      CONTAINER_PROJECTS.length,
    )
    CONTAINER_PROJECTS.forEach((project) => {
      expect(
        within(body).getByRole('heading', { name: project.title, level: 3 }),
      ).toBeInTheDocument()
      expect(within(body).getByText(project.description)).toBeInTheDocument()
    })
  })

  it('plays a terminal for every container, from its own demo', async () => {
    const terminals = within(await section()).getAllByTestId('terminal-window')

    expect(terminals).toHaveLength(CONTAINER_PROJECTS.length)
    terminals.forEach((terminal, index) => {
      expect(JSON.parse(terminal.dataset.script!)).toEqual(CONTAINER_PROJECTS[index].demo)
    })
  })

  it('puts each terminal on the card of its project', async () => {
    const body = await section()

    CONTAINER_PROJECTS.forEach((project) => {
      const card = within(body)
        .getByRole('heading', { name: project.title, level: 3 })
        .closest('a')!

      expect(within(card).getAllByTestId('terminal-window')).toHaveLength(1)
    })
  })

  it('ships the rick roll with the yt-dlp terminal only', async () => {
    const body = await section()

    CONTAINER_PROJECTS.forEach((project) => {
      const card = within(body)
        .getByRole('heading', { name: project.title, level: 3 })
        .closest('a')!
      const template = card.querySelector('template[data-media="rick-roll"]')

      if (project.title === RICK_ROLLER) expect(template, project.title).not.toBeNull()
      else expect(template, project.title).toBeNull()
    })
    expect(CONTAINER_PROJECTS.map((project) => project.title)).toContain(RICK_ROLLER)
  })

  it('renders the tags of every container on its own card', async () => {
    const body = await section()

    CONTAINER_PROJECTS.forEach((project) => {
      const card = within(body)
        .getByRole('heading', { name: project.title, level: 3 })
        .closest('a')!
      const tags = card.querySelectorAll('[data-slot="badge"]')

      expect([...tags].map((tag) => tag.textContent?.trim())).toEqual(project.tags)
    })
  })

  it('makes the whole card the link to its source', async () => {
    const body = await section()

    CONTAINER_PROJECTS.forEach((project) => {
      const card = within(body).getByRole('heading', { name: project.title, level: 3 }).closest('a')

      expect(card).toHaveAttribute('href', project.links[0].url)
      expect(card).toHaveAttribute('target', '_blank')
      expect(card).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
