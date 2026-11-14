// @vitest-environment node
import { within } from '@testing-library/dom'

import HostList from '@/components/infra/HostList.astro'
import { displayHost, isBrowsable, type SiteReach, sitesReaching, siteUrl } from '@/data/sites'
import { render } from '@/test/astro'

async function hosts(reach: SiteReach) {
  return render(HostList, { props: { reach } })
}

describe('HostList', () => {
  it.each(['public', 'onion', 'i2p', 'lan', 'ci'] as const)(
    'gives the %s list its own test id and a row per hostname',
    async (reach) => {
      const list = within(await hosts(reach)).getByTestId(`hosts-${reach}`)

      expect(within(list).getAllByRole('listitem')).toHaveLength(sitesReaching(reach).length)
    },
  )

  it('links every public hostname a browser can open', async () => {
    const hrefs = within(await hosts('public'))
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))

    expect(hrefs).toEqual(sitesReaching('public').filter(isBrowsable).map(siteUrl))
  })

  it('opens each one but this site safely in a tab of its own', async () => {
    const links = within(await hosts('public')).getAllByRole('link')

    for (const link of links) {
      if (link.getAttribute('href') === '#') continue
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('keeps this site in the same tab, at its own top', async () => {
    const self = within(await hosts('public'))
      .getByText('h3nc4.com')
      .closest('a')!

    expect(self).toHaveAttribute('href', '#')
    expect(self).not.toHaveAttribute('target')
    expect(self).not.toHaveAttribute('rel')
  })

  it.each(['onion', 'i2p'] as const)(
    'prints each %s name on one line, with the whole one on hover',
    async (reach) => {
      const body = await hosts(reach)

      for (const site of sitesReaching(reach)) {
        const name = within(body).getByText(displayHost(site))

        expect(name).toHaveClass('truncate')
        expect(name.closest('a')).toHaveAttribute('title', site.host)
      }
    },
  )

  it('lets a public name wrap anywhere rather than cut it short', async () => {
    const name = within(await hosts('public')).getByText('h3nc4.com')

    expect(name).not.toHaveClass('truncate')
    expect(name).toHaveClass('[overflow-wrap:anywhere]')
  })

  it('names the mail and VPN hosts without linking them', async () => {
    const body = await hosts('public')

    for (const host of ['mail.h3nc4.com', 'vpn.h3nc4.com']) {
      const name = within(body).getByText(host)

      expect(name.closest('a'), host).toBeNull()
    }
    expect(within(body).queryByRole('link', { name: /mail\.h3nc4\.com/ })).not.toBeInTheDocument()
  })

  it.each(['onion', 'i2p'] as const)('links every %s address over plain HTTP', async (reach) => {
    const hrefs = within(await hosts(reach))
      .getAllByRole('link')
      .map((link) => link.getAttribute('href'))

    expect(hrefs).toEqual(sitesReaching(reach).map((site) => `http://${site.host}`))
  })

  it('links no LAN hostname, since a visitor cannot reach one', async () => {
    expect(within(await hosts('lan')).queryAllByRole('link')).toEqual([])
  })

  it('lists every LAN hostname', async () => {
    const body = await hosts('lan')

    for (const site of sitesReaching('lan')) {
      expect(within(body).getByText(site.host), site.host).toBeInTheDocument()
    }
  })

  it('describes what each service does', async () => {
    const body = await hosts('lan')

    expect(within(body).getByText('Log aggregation.')).toBeInTheDocument()
    expect(within(body).getByText('Metric collection and storage.')).toBeInTheDocument()
  })

  it('names what answers each hostname', async () => {
    const body = await hosts('public')

    expect(within(body).getByText('SonarQube')).toBeInTheDocument()
    expect(within(body).getByText('Minecraft')).toBeInTheDocument()
  })
})
