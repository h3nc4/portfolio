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

import { getContainerRenderer } from '@astrojs/react/container-renderer'
import {
  type ContainerRenderOptions,
  experimental_AstroContainer as AstroContainer,
} from 'astro/container'
// eslint-disable-next-line import-x/no-unresolved -- a virtual module only Astro's Vite plugin resolves
import { loadRenderers } from 'astro:container'
import { JSDOM } from 'jsdom'

type AstroComponent = Parameters<AstroContainer['renderToString']>[0]

let shared: Promise<AstroContainer> | undefined

// React draws the lucide and react-icons components to static SVG, as it does in the build
function container(): Promise<AstroContainer> {
  shared ??= loadRenderers([getContainerRenderer()]).then((renderers) =>
    AstroContainer.create({ renderers }),
  )
  return shared
}

/** The markup a component renders to, as the build would write it. */
export async function renderHtml(
  component: AstroComponent,
  options?: ContainerRenderOptions,
): Promise<string> {
  return (await container()).renderToString(component, options)
}

/** A whole document parsed from a page's markup. */
export function parse(html: string): Document {
  return new JSDOM(html).window.document
}

/** The body a component renders into, for queries with `within`. */
export async function render(
  component: AstroComponent,
  options?: ContainerRenderOptions,
): Promise<HTMLElement> {
  return parse(await renderHtml(component, options)).body
}

/** Every comment node under `root`. */
export function comments(root: Node): Comment[] {
  const document = root.ownerDocument ?? (root as Document)
  const walker = document.createTreeWalker(root, document.defaultView!.NodeFilter.SHOW_COMMENT)
  const found: Comment[] = []
  while (walker.nextNode()) found.push(walker.currentNode as Comment)
  return found
}
