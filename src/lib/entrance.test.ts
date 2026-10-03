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
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Portfolio.  If not, see <https://www.gnu.org/licenses/>.
 */

import { describe, expect, it } from 'vitest'

import { siblingUrl } from './entrance'

describe('siblingUrl', () => {
  it('stays on the clearnet host', () => {
    expect(siblingUrl('wasudoku', { protocol: 'https:', host: 'h3nc4.com' })).toBe(
      'https://wasudoku.h3nc4.com',
    )
  })

  it('stays on the onion host', () => {
    const onion = 'example2345abcdefexample2345abcdefexample2345abcdefabcd.onion'
    expect(siblingUrl('wasudoku', { protocol: 'http:', host: onion })).toBe(
      `http://wasudoku.${onion}`,
    )
  })

  it('drops a leading www', () => {
    expect(siblingUrl('wasudoku', { protocol: 'https:', host: 'www.h3nc4.com' })).toBe(
      'https://wasudoku.h3nc4.com',
    )
  })

  it('defaults to the current location', () => {
    expect(siblingUrl('wasudoku')).toBe(`${location.protocol}//wasudoku.${location.host}`)
  })
})
