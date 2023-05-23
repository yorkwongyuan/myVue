import Watcher from '../observer/watcher'
import VNode from '../vdom/vnode'
let visitor = {
  divVisitor (div) {
    const children = div.children
    for (let i of children) {
      this.visit(i)
    }
  },
  pVisitor (p) {
    // 倒序
    // p.children = p.children.reverse()
    // 删除
    // p.children.length = parseInt((p.children.length)/2)
    // 新增
    // p.children.push(new VNode(undefined, {key: 'newTag'}, [],'新节点'))
    // 换位置
    function change (arr, oldIndex, newIndex) {
      let element = arr.splice(oldIndex, 1)[0]
      arr.splice(newIndex, 0, element)
    }
    change(p.children, 0, 1)
    change(p.children, 3, 4)

  },
  visit (vnode) {
    if (vnode.tag === 'div') {
      this.divVisitor(vnode)
    } else if (vnode.tag === 'p') {
      this.pVisitor(vnode)
    }
  }
}
export function lifecycleMixin (Vue) {
  // 将虚拟dom转为真实节点
  /**
   *
   * @param {*} vnode vm._render()返回的结果
   */
  Vue.prototype._update = function (vnode) {
    const vm = this
    let prevNode = vm._vnode
    let prevEl = vm.$el
    vm._vnode = vnode
    // 首次
    if (!prevNode) {
      vm.$el = vm.__patch__(vm.$el, vnode)
    // 更新
    } else {
      visitor.visit(vnode)
      vm.$el = vm.__patch__(prevNode, vnode)
    }
    if (prevEl) {
      prevEl.__vue__ = null
    }
  }
}


export function mountComponent (vm, el) {
  vm.$el = el
  const updateComponent = function () {
    vm._update(vm._render())
    // const result = vm._render()
    // console.log('🚀 ~ file: lifecycle.js:33 ~ updateComponent ~ result:', result)
  }
  // vm._update(vm._render())
  new Watcher(vm, updateComponent)
}
