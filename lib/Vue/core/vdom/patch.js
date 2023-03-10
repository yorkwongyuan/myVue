import { isDef, isArray, isPrimitive, isUndef } from "../../shared/util"
import VNode from "./vnode"
const hooks = ['create', 'destroy']
// 空的虚拟dom
const emptyVnode = new VNode('', {}, [])
export function createPatchFunction (backend) {
  const {nodeOps, modules} = backend
  let cbs = {}
  // 将各个模块的钩子都组装到一个对象中去
  for (let i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = []
    for (let j = 0; j < modules.length; ++j) {
      // 如果某个模块有对应的钩子函数, 则进行组装
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]])
      }
    }
  }
  console.log(cbs, 'cbs')
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
    const data = vnode.data //属性
    if (isDef(tag)) {
      vnode.elm = nodeOps.createElement(tag)
      createChildren(vnode, children, insertedVNodeQueue)
      if (isDef(data)) {
        invokeCreateHooks(emptyVnode, vnode)
      }
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
    } else {
      patchVnode(oldVnode, vnode)
    }
  }
  // 根据vnode改造oldvnode
  function patchVnode (oldVnode, vnode) {
    const elm = (vnode.elm = oldVnode.elm)
    const ch = vnode.children
    const oldCh = oldVnode.children
    // 如果新的节点没有文本内容
    if (isUndef(vnode.text)) {
      if (ch && oldCh) {
        if (ch !== oldCh) {
          // 更新子节点todo
          updateChildren(elm, ch, oldCh)
        }
      // 原来没有子节点, 现在有, 则 增加子节点
      } else if (isDef(ch)) {
        if (oldVnode.text) {
          nodeOps.setTextContent(vnode, '')
        }
        // 增加操作todo
        addVnodes(elm, null, ch, 0, ch.length - 1)
      // 原来有, 现在没有, 删除子节点
      } else if (isDef(oldVnode)) {
        // 删除操作todo
      }
    // 如果新老文本都存在, 且不同, 则按照新的文本内容设置
    } else if (vnode.text !== oldVnode.text){
      nodeOps.setTextContent(elm, vnode.text)
    }
  }

  // 增加节点
  function addVnodes (parentElm, refElm, vnodes, startIndex, endIndex, insertedVNodeQueue) {
    for (;startIndex <= endIndex; ++startIndex) {
      createElem(vnodes[startIndex], insertedVNodeQueue, parentElm, refElm)
    }
  }

  //
  function updateChildren (parentElm, ch, oldCh) {
    let startOldIndex = 0
    let endOldIndex = oldCh.length - 1

    let startNewIndex = 0
    let endNewIndex = ch.length - 1

    let startOldVnode = oldCh[startOldIndex]
    let endOldVnode = oldCh[endOldIndex]
    let startNewVnode = ch[startNewIndex]
    let endNewVnode = ch[endNewIndex]

    while(startOldIndex <= endOldIndex && startNewIndex <= endNewIndex) {
      if (isUndef(startOldVnode)) {
        startOldVnode = ch[++startOldIndex]
      } else if (isUndef(endOldVnode)) {
        endOldVnode = ch[--endOldIndex]
      } else {
        patchVnode(startOldVnode, startNewVnode)
        startOldVnode = oldCh[++startOldIndex]
        startNewVnode = ch[++startNewIndex]
      }
    }
  }
  function invokeCreateHooks (emptyVnode, vnode) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyVnode, vnode)
    }
  }
}

