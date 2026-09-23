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

import { describe, expect, it } from 'vitest'

import { isBrowsable, PUBLIC_WEB_COUNT, SITES, sitesReaching, siteUrl } from './sites'
import { TOPOLOGY_INDEX } from './topology'

describe('siteUrl', () => {
  it('reaches a host over TLS', () => {
    expect(siteUrl(SITES[0])).toBe(`https://${SITES[0].host}`)
  })
})

describe('the tunnel sites', () => {
  it('routes more than one hostname', () => {
    expect(SITES.length).toBeGreaterThan(3)
  })

  it('points every hostname at a service that exists', () => {
    for (const site of SITES) {
      expect(TOPOLOGY_INDEX.has(site.service), site.host).toBe(true)
    }
  })

  it('keeps every hostname inside the one domain', () => {
    for (const site of SITES) {
      expect(site.host, site.host).toMatch(/(^|\.)h3nc4\.com$/)
    }
  })

  it('names each hostname once', () => {
    const hosts = SITES.map((site) => site.host)

    expect(new Set(hosts).size).toBe(hosts.length)
  })

  it('says what each one serves', () => {
    for (const site of SITES) {
      expect(site.serves.length, site.host).toBeGreaterThan(2)
    }
  })
})

describe('the two bands', () => {
  it('puts every hostname in exactly one band', () => {
    const counted =
      sitesReaching('public').length + sitesReaching('lan').length + sitesReaching('ci').length

    expect(counted).toBe(SITES.length)
  })

  it('counts only the public sites a browser can open', () => {
    expect(PUBLIC_WEB_COUNT).toBe(sitesReaching('public').filter(isBrowsable).length)
  })

  it('leaves mail and the VPN out of the website count', () => {
    expect(PUBLIC_WEB_COUNT).toBeLessThan(sitesReaching('public').length)
  })

  it('names each copy of a service that runs on both machines', () => {
    for (const service of ['node-exporter', 'cadvisor']) {
      const hosts = SITES.filter((site) => site.host.startsWith(`${service}.`)).map((s) => s.host)

      expect(hosts, service).toEqual([
        `${service}.gem.lan.h3nc4.com`,
        `${service}.gems.lan.h3nc4.com`,
      ])
    }
  })

  it('points the two copies at different machines', () => {
    const pair = SITES.filter((site) => site.host.startsWith('node-exporter.'))

    expect(new Set(pair.map((site) => site.service)).size).toBe(2)
  })

  it('keeps the CI guests out of the LAN band', () => {
    expect(sitesReaching('lan').some((site) => site.host.startsWith('ci-'))).toBe(false)
  })

  it('treats no private hostname as browsable by a visitor', () => {
    for (const site of [...sitesReaching('lan'), ...sitesReaching('ci')]) {
      expect(isBrowsable(site), site.host).toBe(false)
    }
  })

  it('names every CI guest, so a log line can say ci-b', () => {
    const guests = sitesReaching('ci')

    expect(guests.map((site) => site.host)).toEqual([
      'ci-a.lan.h3nc4.com',
      'ci-b.lan.h3nc4.com',
      'ci-c.lan.h3nc4.com',
      'ci-d.lan.h3nc4.com',
    ])
  })

  it('points each CI name at the guest it belongs to', () => {
    for (const site of sitesReaching('ci')) {
      expect(TOPOLOGY_INDEX.get(site.service)?.label, site.host).toBe(site.host.split('.')[0])
    }
  })

  it('keeps every private hostname inside the lan subdomain', () => {
    for (const site of [...sitesReaching('lan'), ...sitesReaching('ci')]) {
      expect(site.host, site.host).toMatch(/\.lan\.h3nc4\.com$/)
    }
  })

  it('describes what every service does, briefly', () => {
    for (const site of SITES) {
      expect(site.about.length, site.host).toBeGreaterThan(10)
      expect(site.about.length, site.host).toBeLessThan(45)
      expect(site.about, site.host).toMatch(/\.$/)
    }
  })

  it('leaves the plumbing out of the descriptions', () => {
    const plumbing = /tunnel|proxy|open port|reachable|libvirt|IPv[46]|loopback|NAT/i

    for (const site of SITES) {
      expect(site.about, site.host).not.toMatch(plumbing)
    }
  })
})
