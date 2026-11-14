// @vitest-environment node
import { within } from '@testing-library/dom'

import SelectedProjects from '@/components/sections/SelectedProjects.astro'
import { SELECTED_PROJECTS } from '@/data/projects'
import { render } from '@/test/astro'

async function section() {
  return render(SelectedProjects)
}

describe('SelectedProjects', () => {
  it('renders the section header and intro', async () => {
    const body = await section()

    expect(
      within(body).getByRole('heading', { name: 'Selected Projects', level: 2 }),
    ).toBeInTheDocument()
    expect(within(body).getByText(/A distribution, a Go service/)).toBeInTheDocument()
  })

  it('renders a card per selected project', async () => {
    const body = await section()

    SELECTED_PROJECTS.forEach((project) => {
      expect(
        within(body).getByRole('heading', { name: project.title, level: 3 }),
      ).toBeInTheDocument()
      expect(within(body).getByText(project.description)).toBeInTheDocument()
    })
  })

  // Under the title rather than among the tags, where a language can also appear
  it('names the language of each project under its title', async () => {
    const body = await section()

    SELECTED_PROJECTS.forEach((project) => {
      const heading = within(body).getByRole('heading', { name: project.title, level: 3 })

      expect(heading.nextElementSibling?.textContent?.trim(), project.title).toBe(project.language)
    })
  })

  it('links each card to its first link', async () => {
    const body = await section()

    SELECTED_PROJECTS.forEach((project) => {
      const card = within(body).getByText(project.title).closest('a')

      expect(card).toHaveAttribute('href', project.links[0].url)
      expect(card).toHaveAttribute('target', '_blank')
      expect(card).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('renders the tags of every project on its own card', async () => {
    const body = await section()

    SELECTED_PROJECTS.forEach((project) => {
      const card = within(body).getByText(project.title).closest('a')!
      const tags = card.querySelectorAll('[data-slot="badge"]')

      expect([...tags].map((tag) => tag.textContent?.trim())).toEqual(project.tags)
    })
  })

  it('leaves out the featured projects', async () => {
    const body = await section()

    expect(within(body).queryByText('HyperGesture')).not.toBeInTheDocument()
    expect(within(body).queryByText('WASudoku')).not.toBeInTheDocument()
  })

  it('renders one card per selected project', async () => {
    const body = await section()

    expect(within(body).getAllByRole('heading', { level: 3 })).toHaveLength(
      SELECTED_PROJECTS.length,
    )
    expect(within(body).getAllByRole('link')).toHaveLength(SELECTED_PROJECTS.length)
  })

  it('staggers the cards by a tenth of a second each', async () => {
    const body = await section()
    const delays = within(body)
      .getAllByRole('link')
      .map((card) => card.closest('.reveal')?.getAttribute('data-delay') ?? null)

    expect(delays).toEqual(
      SELECTED_PROJECTS.map((_, index) =>
        index === 0 ? null : String(Number((0.1 * index).toFixed(3))),
      ),
    )
  })
})
