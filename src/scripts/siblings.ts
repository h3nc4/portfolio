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

import { siblingUrl } from '@/lib/entrance'
import { afterLoad } from '@/scripts/afterLoad'

type Entrance = Pick<Location, 'protocol' | 'host'>

// The page is built once and served from several hosts, so a link to a sibling service is
// pointed at the host this visit arrived on, and a frame boots only once the page is idle.
export function retargetSiblings(
  root: ParentNode = document,
  entrance: Entrance = location,
  win: Window = window,
): () => void {
  for (const link of root.querySelectorAll<HTMLAnchorElement>('a[data-sibling]')) {
    link.href = siblingUrl(link.dataset.sibling!, entrance)
  }

  const frames = [...root.querySelectorAll<HTMLIFrameElement>('iframe[data-sibling-src]')]
  return afterLoad(() => {
    for (const frame of frames) frame.src = siblingUrl(frame.dataset.siblingSrc!, entrance)
  }, win)
}
