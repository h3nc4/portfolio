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
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { isBrowsable, sitesReaching } from '@/data/sites'

import { HostList } from './HostList'

describe('HostList', () => {
  it('links every public hostname a browser can open', () => {
    render(<HostList reach="public" />)

    const hrefs = screen.getAllByRole('link').map((link) => link.getAttribute('href'))

    expect(hrefs).toEqual(
      sitesReaching('public')
        .filter(isBrowsable)
        .map((site) => `https://${site.host}`),
    )
  })

  it('opens each one safely in a tab of its own', () => {
    render(<HostList reach="public" />)

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })

  it('names the mail and VPN hosts without linking them', () => {
    render(<HostList reach="public" />)

    expect(screen.getByText('mail.h3nc4.com')).toBeInTheDocument()
    expect(screen.getByText('vpn.h3nc4.com')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /mail\.h3nc4\.com/ })).not.toBeInTheDocument()
  })

  it('links no LAN hostname, since a visitor cannot reach one', () => {
    render(<HostList reach="lan" />)

    expect(screen.queryAllByRole('link')).toEqual([])
  })

  it('lists every LAN hostname', () => {
    render(<HostList reach="lan" />)

    for (const site of sitesReaching('lan')) {
      expect(screen.getByText(site.host), site.host).toBeInTheDocument()
    }
  })

  it('describes what each service does', () => {
    render(<HostList reach="lan" />)

    expect(screen.getByText('Log aggregation.')).toBeInTheDocument()
    expect(screen.getByText('Metric collection and storage.')).toBeInTheDocument()
  })

  it('names what answers each hostname', () => {
    render(<HostList reach="public" />)

    expect(screen.getByText('SonarQube')).toBeInTheDocument()
    expect(screen.getByText('Minecraft')).toBeInTheDocument()
  })
})
