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

import { isBrowsable, type Site, type SiteReach, sitesReaching, siteUrl } from '@/data/sites'

/*
 * The hostnames in one band. A public one a browser can open is a link. A LAN
 * name is not, since a visitor's request would go nowhere.
 */

const ROW = 'flex flex-wrap items-baseline gap-x-2 border-b border-dawn-cream/10 py-2'

/** What answers the hostname, and one sentence on what it does. */
function Detail({ site }: Readonly<{ site: Site }>) {
  return (
    <>
      <span className="text-dawn-sand ml-auto font-mono text-[10px] tracking-wide">
        {site.serves}
      </span>
      <span className="text-dawn-taupe w-full text-[11px] leading-snug font-light">
        {site.about}
      </span>
    </>
  )
}

export function HostList({ reach }: Readonly<{ reach: SiteReach }>) {
  return (
    <ul
      data-testid={`hosts-${reach}`}
      className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3"
    >
      {sitesReaching(reach).map((site) =>
        isBrowsable(site) ? (
          <li key={site.host}>
            <a
              href={siteUrl(site)}
              target="_blank"
              rel="noopener noreferrer"
              className={`group hover:border-dawn-accent ${ROW} no-underline`}
            >
              <span className="text-dawn-cream group-hover:text-dawn-accent-hi font-mono text-xs">
                {site.host}
              </span>
              <Detail site={site} />
            </a>
          </li>
        ) : (
          <li key={site.host} className={ROW}>
            <span className="text-dawn-sand font-mono text-xs">{site.host}</span>
            <Detail site={site} />
          </li>
        ),
      )}
    </ul>
  )
}
