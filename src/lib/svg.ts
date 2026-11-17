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

import { type ComponentType, createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export interface SvgProps {
  readonly className?: string
  readonly 'aria-hidden'?: 'true'
}

/** A lucide or react-icons component drawn to static SVG markup at build time, for a page without React. */
export function svg(icon: ComponentType<SvgProps>, props: SvgProps = {}): string {
  return renderToStaticMarkup(createElement(icon, props))
}
