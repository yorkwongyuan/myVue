import { isDef, isArray, isPrimitive } from "../../shared/util"
import VNode from "./vnode"

export function createPatchFunction (backend) {
  const {nodeOps} = backend
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref)
        }
      } else {
        nodeOps.appendChild(parent, elm)
      }
    }
  }

  // 将虚拟dom转为真实dom
  function createElem (vnode, insertedVNodeQueue, parentElm, refElm, nested, owerArray, index) {
    const children = vnode.children
    const tag = vnode.tag
    if (isDef(tag)) {
      vnode.elm = nodeOps.createElement(tag)
      createChildren(vnode, children, insertedVNodeQueue)
      insert(parentElm, vnode.elm, refElm)
    } else {
      vnode.elm = nodeOps.createTextNode(String(vnode.text))
      insert(parentElm, vnode.elm, refElm)
    }
  }
  // 创建子节点
  function createChildren (vnode, children, insertedVNodeQueue) {
    if (isArray(children)) {
      for (let i = 0; i<children.length; i++) {
        createElem(children[i], insertedVNodeQueue, vnode.elm, null)
      }
    } else if (isPrimitive(children)) {
      nodeOps.appendChild(vnode.elm, child)
    }
  }
  return function patch (oldVnode, vnode) {
    const isRealElement = isDef(oldVnode.nodeType)
    const insertedVNodeQueue = []
    // 是否有真实节点
    if (isRealElement) {
      // 真实节点转为虚拟dom
      oldVnode = emptyNodeAt(oldVnode)
      let oldElm = oldVnode.elm
      let parentElm = nodeOps.parentNode(oldElm)
      createElem(vnode, insertedVNodeQueue, parentElm, nodeOps.nextSibling(oldElm))
    }
  }
}
