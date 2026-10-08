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
export type SiteReach = 'public' | 'onion' | 'lan' | 'ci'

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
  /** True for the page the visitor is already on, which links to its own top rather than a new tab. */
  self?: boolean
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

/** Where a browser goes for one of them. An onion address is plain HTTP, since Tor already encrypts the circuit. */
export function siteUrl(site: Site): string {
  if (site.self) return '#'
  const scheme = site.reach === 'onion' ? 'http' : 'https'
  return `${scheme}://${site.host}`
}

/** Length every onion name prints at, so the two rows match and fit the narrowest column. */
const ONION_DISPLAY_LENGTH = 27
const ONION_SUFFIX = '.onion'
const ELISION = '...'

/** The hostname as the list prints it, with the middle of an onion address elided to a fixed length. */
export function displayHost(site: Site): string {
  if (site.reach !== 'onion') return site.host
  const name = site.host.slice(0, -ONION_SUFFIX.length)
  const split = name.lastIndexOf('.') + 1
  const prefix = name.slice(0, split)
  const address = name.slice(split)
  const room = ONION_DISPLAY_LENGTH - prefix.length - ELISION.length - ONION_SUFFIX.length
  const head = Math.ceil(room / 2)
  const tail = room - head
  return `${prefix}${address.slice(0, head)}${ELISION}${address.slice(-tail)}${ONION_SUFFIX}`
}

/** True when a visitor can open it, which the LAN names and mail are not. */
export function isBrowsable(site: Site): boolean {
  return (site.reach === 'public' || site.reach === 'onion') && site.web !== false
}

/** Public sites a browser can open, which is the figure the section states. The onion names are the same sites again. */
export const PUBLIC_WEB_COUNT = sitesReaching('public').filter(isBrowsable).length
