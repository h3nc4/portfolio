// @vitest-environment node
import { within } from '@testing-library/dom'

import ProjectFamilies from '@/components/sections/ProjectFamilies.astro'
import { EXTRAS, FAMILIES } from '@/data/projects'
import { render } from '@/test/astro'

async function section() {
  return render(ProjectFamilies)
}

describe('ProjectFamilies', () => {
  it('renders the section header and intro', async () => {
    const body = await section()

    expect(
      within(body).getByRole('heading', { name: 'Repository Families', level: 2 }),
    ).toBeInTheDocument()
    expect(within(body).getByText(/Each family is one idea repeated/)).toBeInTheDocument()
  })

  it('renders every family under its own heading', async () => {
    const body = await section()

    expect(
      within(body)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent?.trim()),
    ).toEqual(FAMILIES.map((family) => family.name))
  })

  it('renders every repository in every family, linked in a new tab', async () => {
    const body = await section()

    FAMILIES.forEach((family) => {
      family.items.forEach((item) => {
        const link = within(body).getByText(item.title).closest('a')

        expect(within(body).getByText(item.what)).toBeInTheDocument()
        expect(link).toHaveAttribute('href', item.url)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  it('shows no terminal demo, since no single one covers three families', async () => {
    expect(within(await section()).queryByTestId('terminal-window')).not.toBeInTheDocument()
  })

  it('mentions the smaller repositories and the mirror', async () => {
    const body = await section()

    expect(within(body).getByText('Smaller things')).toBeInTheDocument()
    EXTRAS.forEach((extra) => {
      expect(within(body).getByRole('link', { name: extra.title })).toHaveAttribute(
        'href',
        extra.url,
      )
    })
    expect(within(body).getByRole('link', { name: 'all of it on cgit' })).toHaveAttribute(
      'href',
      'https://cgit.h3nc4.com',
    )
  })

  it('links nothing else', async () => {
    const items = FAMILIES.flatMap((family) => family.items)

    expect(within(await section()).getAllByRole('link')).toHaveLength(
      items.length + EXTRAS.length + 1,
    )
  })
})
