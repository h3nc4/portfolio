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

type Entrance = Pick<Location, 'protocol' | 'host'>

/**
 * Builds the URL of a service one label under whatever host served this page, so
 * a link follows the entrance rather than sending an onion visitor to the clearnet.
 */
export function siblingUrl(label: string, { protocol, host }: Entrance = location): string {
  return `${protocol}//${label}.${host.replace(/^www\./, '')}`
}
