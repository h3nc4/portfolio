// @vitest-environment node
import { within } from '@testing-library/dom'

import Footer from '@/components/sections/Footer.astro'
import { render } from '@/test/astro'

describe('Footer', () => {
  it('renders the copyright with the current year', async () => {
    const body = await render(Footer)
    const currentYear = new Date().getFullYear()

    expect(within(body).getByText(`© ${currentYear} Henrique Almeida.`)).toBeInTheDocument()
  })

  it('links the source of this site in a new tab', async () => {
    const footer = within(await render(Footer)).getByRole('contentinfo')
    const link = within(footer).getByRole('link', { name: /knowledge should be free/ })

    expect(link).toHaveAttribute('href', 'https://github.com/h3nc4/portfolio')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
