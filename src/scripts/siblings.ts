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
