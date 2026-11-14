// @vitest-environment node
import { within } from '@testing-library/dom'

import FeaturedProject from '@/components/sections/FeaturedProject.astro'
import { type FeaturedProjectData, HYPERGESTURE, WASUDOKU } from '@/data/featured'
import { render } from '@/test/astro'

const PREVIEW = '<div data-testid="preview"></div>'

async function column(project: FeaturedProjectData, props: Record<string, unknown> = {}) {
  return render(FeaturedProject, { props: { project, ...props }, slots: { preview: PREVIEW } })
}

describe('FeaturedProject', () => {
  it('renders WASudoku with its stack', async () => {
    const body = await column(WASUDOKU)

    expect(within(body).getByRole('heading', { name: 'WASudoku', level: 3 })).toBeInTheDocument()
    expect(within(body).getByText('Vite / Rust / TS / PWA')).toBeInTheDocument()
  })

  it('points Open App at the canonical sibling, for the page to repoint', async () => {
    const openApp = within(await column(WASUDOKU)).getByRole('link', { name: 'Open App' })

    expect(openApp).toHaveAttribute('href', 'https://wasudoku.h3nc4.com')
    expect(openApp).toHaveAttribute('data-sibling', 'wasudoku')
    expect(openApp).toHaveAttribute('target', '_blank')
  })

  it('renders the WASudoku source links', async () => {
    const body = await column(WASUDOKU)

    expect(within(body).getByRole('link', { name: 'WASudoku on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/h3nc4/WASudoku',
    )
    expect(within(body).getByRole('link', { name: 'WASudoku on cgit' })).toHaveAttribute(
      'href',
      'https://cgit.h3nc4.com/WASudoku',
    )
  })

  it('marks no other link as a sibling', async () => {
    const body = await column(WASUDOKU)
    const siblings = within(body)
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('data-sibling'))

    expect(siblings.map((link) => link.textContent?.trim())).toEqual(['Open App'])
  })

  it('renders HyperGesture with its stack', async () => {
    const body = await column(HYPERGESTURE)

    expect(
      within(body).getByRole('heading', { name: 'HyperGesture', level: 3 }),
    ).toBeInTheDocument()
    expect(within(body).getByText('Kotlin / Compose / Android')).toBeInTheDocument()
    expect(within(body).getByText(/third-party launcher/)).toBeInTheDocument()
  })

  it('renders HyperGesture links, the APK in the same tab', async () => {
    const body = await column(HYPERGESTURE)

    const website = within(body).getByRole('link', { name: 'Website' })
    expect(website).toHaveAttribute('href', 'https://hypergesture.h3nc4.com')
    expect(website).toHaveAttribute('target', '_blank')
    expect(website).toHaveAttribute('rel', 'noopener noreferrer')

    const apk = within(body).getByRole('link', { name: 'Download APK' })
    expect(apk).toHaveAttribute(
      'href',
      'https://github.com/h3nc4/HyperGesture/releases/latest/download/hypergesture.apk',
    )
    expect(apk).not.toHaveAttribute('target')
    expect(apk).not.toHaveAttribute('rel')

    expect(within(body).getByRole('link', { name: 'HyperGesture on GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/h3nc4/HyperGesture',
    )
  })

  it('gives the first link the primary style', async () => {
    const [primary, ...rest] = within(await column(HYPERGESTURE)).getAllByRole('link')

    expect(primary).toHaveClass('bg-dawn-accent')
    expect(primary).toHaveAttribute('data-variant', 'default')
    rest.forEach((link) => {
      expect(link).not.toHaveClass('bg-dawn-accent')
      expect(link).toHaveAttribute('data-variant', 'outline')
    })
  })

  it('draws a hidden icon in every link', async () => {
    const links = within(await column(HYPERGESTURE)).getAllByRole('link')

    links.forEach((link) => {
      expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  it('puts the preview above the text, in a column that carries the project id', async () => {
    const body = await column(WASUDOKU)
    const article = within(body).getByRole('article')
    const preview = within(body).getByTestId('preview')

    expect(article).toHaveAttribute('id', 'wasudoku')
    expect(article).toContainElement(preview)
    expect(preview.compareDocumentPosition(within(body).getByRole('heading'))).toBe(
      preview.ownerDocument.defaultView!.Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('delays the text by the delay it is given', async () => {
    const heading = within(await column(WASUDOKU, { delay: 0.1 })).getByRole('heading')

    expect(heading.closest('.reveal')).toHaveAttribute('data-delay', '0.1')
  })
})
