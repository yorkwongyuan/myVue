import { isUndef } from "../../../../shared/util"
import { updateListeners } from "../../../../core/vdom/helpers/update-listeners"
let target

function add (name, handler, capture, passive) {
  target.addEventListener(name, handler)
}

function updateDomListeners (oldVnode, vnode) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)){
    return
  }
  target = vnode.elm || oldVnode.elm
  const on = vnode.data.on
  const oldOn = oldVnode.data.on
  updateListeners(on, add)
}

export default {
  create: updateDomListeners
}
