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

import AnimatedContent from '@/components/AnimatedContent'
import { AlsoRunning } from '@/components/infra/AlsoRunning'
import { HostList } from '@/components/infra/HostList'
import { PUBLIC_PORT_COUNT } from '@/data/exposure'
import { PUBLIC_WEB_COUNT } from '@/data/sites'
import { TOPOLOGY_EDGES } from '@/data/topology'
import { SERVICE_COUNT } from '@/lib/inventory'

/*
 * The homelab as an inventory rather than a graph. Earlier versions drew the
 * fifty links and each one came out a hairball. Above about twenty nodes a
 * node-link diagram loses to a list on every task but tracing a path, and
 * nobody traces a path on a portfolio.
 */

/** One figure and what it counts. */
function Stat({ value, label }: Readonly<{ value: string; label: string }>) {
  return (
    <div>
      <p className="text-dawn-accent-hi font-mono text-3xl leading-none tracking-tight">{value}</p>
      <p className="text-dawn-taupe mt-2 text-[11px] leading-snug font-light">{label}</p>
    </div>
  )
}

export function Infrastructure() {
  return (
    <section>
      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.2}>
        <div className="mb-3 flex items-center gap-4">
          <span className="bg-dawn-stone h-px w-12" />
          <h2 className="text-dawn-cream text-2xl font-medium tracking-tight">Infrastructure</h2>
          <span className="bg-dawn-cream/15 h-px flex-1" />
        </div>
        <p className="text-dawn-taupe mb-8 max-w-prose font-light">
          Two machines behind one router, running {SERVICE_COUNT} services across Docker, libvirt
          and the host itself. The firewall policy is drop.
        </p>
      </AnimatedContent>

      <AnimatedContent distance={20} direction="vertical" delay={0.3} threshold={0.1}>
        <div className="border-dawn-cream/15 mb-10 grid grid-cols-2 gap-6 border-y py-6 sm:grid-cols-3 lg:grid-cols-5">
          <Stat value={String(SERVICE_COUNT)} label="services running" />
          <Stat value={String(PUBLIC_WEB_COUNT)} label="websites served" />
          <Stat value={String(PUBLIC_PORT_COUNT)} label="ports open to the internet, all IPv6" />
          <Stat value="0" label="inbound IPv4, behind the carrier's NAT" />
          <Stat value={String(TOPOLOGY_EDGES.length)} label="links between services" />
        </div>
      </AnimatedContent>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <h3 className="text-dawn-cream mb-1 text-lg font-medium tracking-tight">Public services</h3>
        <p className="text-dawn-taupe mb-4 max-w-prose text-sm font-light">
          Reachable from anywhere. Most arrive on a connection cloudflared made outward, so they
          answer on no open port at all.
        </p>
        <HostList reach="public" />
      </AnimatedContent>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <div className="mt-12">
          <h3 className="text-dawn-cream mb-1 text-lg font-medium tracking-tight">
            Private services
          </h3>
          <p className="text-dawn-taupe mb-4 max-w-prose text-sm font-light">
            The same treatment on the LAN, behind a proxy that answers over TLS. These names resolve
            for nobody outside it.
          </p>
          <HostList reach="lan" />
        </div>
      </AnimatedContent>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <div className="mt-12">
          <h3 className="text-dawn-cream mb-1 text-lg font-medium tracking-tight">CI runners</h3>
          <p className="text-dawn-taupe mb-4 max-w-prose text-sm font-light">
            Four virtual machines, two on each host, thrown away and rebuilt between jobs. Each has
            a name of its own so a failing build can say which one it was.
          </p>
          <HostList reach="ci" />
        </div>
      </AnimatedContent>

      <AnimatedContent distance={20} direction="vertical" delay={0.2} threshold={0.1}>
        <div className="mt-12">
          <h3 className="text-dawn-cream mb-1 text-lg font-medium tracking-tight">Also running</h3>
          <p className="text-dawn-taupe mb-4 max-w-prose text-sm font-light">
            The rest of what each machine runs, answering no hostname of its own.
          </p>
          <AlsoRunning />
        </div>
      </AnimatedContent>
    </section>
  )
}
