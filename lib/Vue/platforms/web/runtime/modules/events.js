import { isUndef } from "../../../../shared/util"
import { updateListeners } from "../../../../core/vdom/helpers/update-listeners"
let target

function add (name, handler, capture, passive) {
  target.addEventListener(name, handler)
}

function updateDomListeners (oldVnode, vnode) {
  if (isUndef(oldVnode) && isUndef(vnode)){
    return
  }
  target = vnode.elm
  const on = vnode.data.on
  updateListeners(on, add)
}

export default {
  create: updateDomListeners
}
