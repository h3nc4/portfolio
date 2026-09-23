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

import rawExposure from './exposure.json'

/*
 * Which clients a rule admits. The old diagram gave this dataset a line colour
 * and nothing more, and it is the one the section opens on. The internet is
 * admitted on 51820, 25, 587, 993 and a UDP range, and on nothing else.
 */
export type Reach = 'internet' | 'tunnel' | 'lan' | 'bridge' | 'vm' | 'loopback'

export interface ExposureRule {
  id: string
  /** Empty when a service answers without any inbound rule. */
  ports: string[]
  proto: string
  family: string
  reach: Reach
  /** The id of the service in the topology this rule admits traffic to. */
  service: string
  listens: string
  purpose: string
}

interface RawExposure {
  rules: ExposureRule[]
}

const data = rawExposure as RawExposure

/** Every firewall rule, transcribed from the ruleset that enforces it. */
export const EXPOSURE_RULES: ExposureRule[] = data.rules

/** The rules admitting one band of clients. */
export function rulesReaching(reach: Reach): ExposureRule[] {
  return EXPOSURE_RULES.filter((rule) => rule.reach === reach)
}

/** Ports that answer from the internet, which is the figure the section opens on. */
export const PUBLIC_PORT_COUNT = rulesReaching('internet').reduce(
  (total, rule) => total + rule.ports.length,
  0,
)
