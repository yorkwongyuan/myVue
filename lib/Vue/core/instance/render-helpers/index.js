import { createTextNode } from '../../vdom/vnode'

export function installRenderHelpers (target) {
  target._v = createTextNode
  target._s = String
}
