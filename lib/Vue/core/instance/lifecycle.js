import Watcher from '../observer/watcher'

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
  }
  // vm._update(vm._render())
  new Watcher(vm, updateComponent)
}
