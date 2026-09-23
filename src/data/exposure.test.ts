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

import { EXPOSURE_RULES, PUBLIC_PORT_COUNT, rulesReaching } from './exposure'
import { TOPOLOGY_INDEX } from './topology'

describe('the exposure data', () => {
  it('counts the ports that answer the internet', () => {
    // 51820 · 25 587 993 · 40000-40040
    expect(PUBLIC_PORT_COUNT).toBe(5)
  })

  it('points every rule at a service that exists', () => {
    for (const rule of EXPOSURE_RULES) {
      expect(TOPOLOGY_INDEX.has(rule.service), `${rule.id} names ${rule.service}`).toBe(true)
    }
  })

  it('says what every rule is for', () => {
    for (const rule of EXPOSURE_RULES) {
      expect(rule.purpose.length, rule.id).toBeGreaterThan(15)
    }
  })

  it('keeps each purpose short enough to read at a glance', () => {
    for (const rule of EXPOSURE_RULES) {
      expect(rule.purpose.length, rule.id).toBeLessThan(90)
    }
  })

  it('keeps the public surface on IPv6, which is the whole argument', () => {
    for (const rule of rulesReaching('internet')) {
      expect(rule.family).toBe('IPv6')
    }
  })

  it('opens no port at all for anything reached through a tunnel', () => {
    for (const rule of rulesReaching('tunnel')) {
      expect(rule.ports).toEqual([])
    }
  })

  it('gives every rule an id of its own', () => {
    const ids = EXPOSURE_RULES.map((rule) => rule.id)

    expect(new Set(ids).size).toBe(ids.length)
  })
})
