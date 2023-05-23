import { isDef, isArray, isPrimitive, isUndef } from "../../shared/util"
import VNode from "./vnode"

// 判断两个vnode是否相同
function sameVnode (a, b) {
  return a.key === b.key && (a.tag === b.tag) && (isDef(a.data) === isDef(b.data))
}
function createKeyToIndex (children, beginIdx, endIdx) {
  let key, i
  const map = {}
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key
    if (isDef(key)) {
      map[key] = i
    }
  }
  return map
}

const hooks = ['create', 'update', 'destroy']

// 空的虚拟dom
const emptyVnode = new VNode('', {}, [])
export function createPatchFunction (backend) {
  const {nodeOps, modules} = backend
  /**
   * 关于下面这个for循环, 主要是针对moudles, 而modules中的每一个元素,
   * 都是一个以hook为键的对象, 值就是这个hook需要执行的逻辑
   * modules整体结构大概就是:
   * [{create: () => {}, update: () => {}}]
   * 所以, 循环过后cbs的结构大概就是:
   * {
   *  create: [() => {}, () => {}],
   *  update: [() => {}, () => {}]
   * }
   * 后续, 在不同的时间节点下, 就可以循环执行不同的hook的逻辑
   */
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

  // 真实节点转为VNode
  function emptyNodeAt (elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
  }

  // 插入节点操作
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
      // 根据表情名创建真实dom节点
      vnode.elm = nodeOps.createElement(tag)
      // 创建子节点
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
        // 递归
        createElem(children[i], insertedVNodeQueue, vnode.elm, null)
      }
    // 如果只是string/number等基础类型, 则直接插入
    } else if (isPrimitive(children)) {
      nodeOps.appendChild(vnode.elm, child)
    }
  }
  // 实际返回的patch方法
  return function patch (oldVnode, vnode) {
    const insertedVNodeQueue = []
    // 如果没有老的节点
    if (isUndef(oldVnode)) {
      createElem(vnode, insertedVNodeQueue)
    } else {
      // 只有真实的dom节点才存在nodeType属性
      const isRealElement = isDef(oldVnode.nodeType)
      // 非真实节点(非首次渲染) && 新老Vnode相同, 说明是普通更新
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode)
      // oldVnode是真实节点 || oldVnode和vnode不同, 此时vnode都要重新渲染
      } else {
        // oldVnode是真实节点
        if (isRealElement) {
          // 转为Vnode
          oldVnode = emptyNodeAt(oldVnode)
        }
        // 这个oldElm是一个真实的节点
        let oldElm = oldVnode.elm
        // 父节点
        let parentElm = nodeOps.parentNode(oldElm)
        // 创建节点
        createElem(vnode, insertedVNodeQueue, parentElm, nodeOps.nextSibling(oldElm))
      }
    }
  }
  // 从旧的队列中找出相同节点
  function findIdxInOld (node, oldCh, start, end) {
    for (let i = start; i <= end; ++i) {
      const c = oldCh[i]
      if (isDef(c) && sameVnode(node, c)) return i
    }
  }
  // 根据vnode改造oldvnode
  function patchVnode (oldVnode, vnode) {
    if (oldVnode === vnode) {
      return
    }
    const elm = (vnode.elm = oldVnode.elm)
    const ch = vnode.children
    const oldCh = oldVnode.children
    if (isDef(vnode.data)) {
      for (let i = 0; i < cbs.update.length; ++i) {
        (cbs.update[i])(oldVnode, vnode)
      }
    }
    // 如果新的节点没有文本内容
    if (isUndef(vnode.text)) {
      // 如果新老节点都存在
      if (ch && oldCh) {
        // 新老节点不同, 说明需要更新
        if (ch !== oldCh) {
          // 更新子节点
          updateChildren(elm, ch, oldCh)
        }
      // 原来没有子节点, 现在有, 则 增加子节点
      } else if (isDef(ch)) {
        if (oldVnode.text) {
          nodeOps.setTextContent(elm, '')
        }
        // 增加操作
        addVnodes(elm, null, ch, 0, ch.length - 1)
      // 原来有, 现在没有, 删除子节点
      } else if (isDef(oldVnode)) {
        // 删除操作
        removeVnodes(oldCh, oldStartIdx, oldEndIdx)
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

  // 删除节点
  function removeVnodes (vnodes, startIdx, endIdx) {
    for (;startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx]
      if (isDef(ch)) {
        removeNode(ch.elm)
      }
    }
  }

  // 删除节点
  function removeNode (el) {
    const parent = nodeOps.parentNode(el)
    if (isDef(parent)) {
      nodeOps.removeChild(parent, el)
    }
  }

  // 更新子节点, diff算法
  function updateChildren (parentElm, ch, oldCh, insertedVnodeQueue) {
    let oldStartIdx = 0
    let oldEndIdx = oldCh.length - 1

    let newStartIdx = 0
    let newEndIdx = ch.length - 1

    let oldStartVnode = oldCh[oldStartIdx]
    let oldEndVnode = oldCh[oldEndIdx]
    let newStartVnode = ch[newStartIdx]
    let newEndVnode = ch[newEndIdx]
    let keyToIndex, idxInOld
    while(oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // if (oldCh.length > 4) {
      // }
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx]
      // 左侧推进
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = ch[++newStartIdx]
      // 右侧推进
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = ch[--newEndIdx]
      // 旧的开始节点和新的结束节点相同
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode)
        // 将新的开始的节点插到原最后一个节点的后面
        nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = ch[--newEndIdx]
      // 旧的结束节点和新的开始节点相同
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode)
        nodeOps.insertBefore(parentElm, oldEndVnode.elm, newStartVnode.elm)
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = ch[++newStartIdx]
      } else {
        console.log('🚀 ~ file: patch.js:246 ~ updateChildren ~ keyToIndex:')
        // 创建key到index的映射表
        keyToIndex = createKeyToIndex(oldCh, oldStartIdx, oldEndIdx)
        idxInOld = isDef(newStartVnode.key) ? keyToIndex[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
        // 如果找不到对应的下标
        if (isUndef(idxInOld)) {
          createElem(newStartVnode, insertedVNodeQueue, parentElm, oldStartVnode.elm)
        // 如果有下标
        } else {
          const vnodeToMove = oldCh[idxInOld]
          // 如果相同
          if (sameVnode(newStartVnode, vnodeToMove)) {
            patchVnode(vnodeToMove, newStartVnode)
            // 注意, 这个不处于边界元素, 必须设为undefined
            oldCh[idxInOld] = undefined
            nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)
          // 如果不同
          } else {
            createElem(newStartVnode, insertedVNodeQueue, parentElm, oldStartVnode.elm)
          }
        }
        newStartVnode = [++newStartIdx]
      }
    }

    if (oldStartIdx > oldEndIdx) {
      // 新增
      const refElm = isUndef(ch[newEndIdx + 1]) ? null : ch[newEndIdx + 1].elm
      addVnodes(parentElm, refElm, ch, newStartIdx, newEndIdx, insertedVnodeQueue)
    } else if (newStartIdx > newEndIdx) {
      // 删除
      removeVnodes(oldCh, oldStartIdx, oldEndIdx)
    }
  }
  function invokeCreateHooks (emptyVnode, vnode) {
    for (let i = 0; i < cbs.create.length; ++i) {
      cbs.create[i](emptyVnode, vnode)
    }
  }
}

