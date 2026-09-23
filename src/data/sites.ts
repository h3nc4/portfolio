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

import rawSites from './sites.json'

/** The set of clients a hostname serves. */
export type SiteReach = 'public' | 'lan' | 'ci'

/** One hostname, and the service behind it. */
export interface Site {
  host: string
  serves: string
  reach: SiteReach
  /** One sentence on what it does, which is what a reader came for. */
  about: string
  /** False when a browser is the wrong client for it, as with mail. */
  web?: boolean
  /** The id of the service in the topology that answers it. */
  service: string
}

interface RawSites {
  sites: Site[]
}

const data = rawSites as RawSites

/** Every hostname either proxy or the tunnel answers. */
export const SITES: Site[] = data.sites

/** The hostnames in one band, in the order the configs state them. */
export function sitesReaching(reach: SiteReach): Site[] {
  return SITES.filter((site) => site.reach === reach)
}

/** Where a browser goes for one of them. */
export function siteUrl(site: Site): string {
  return `https://${site.host}`
}

/** True when a visitor can open it, which the LAN names and mail are not. */
export function isBrowsable(site: Site): boolean {
  return site.reach === 'public' && site.web !== false
}

/** Public sites a browser can open, which is the figure the section states. */
export const PUBLIC_WEB_COUNT = SITES.filter(isBrowsable).length
