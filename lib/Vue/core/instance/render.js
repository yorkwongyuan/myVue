import { createElement } from "../vdom/create-element"
import {installRenderHelpers} from '../../core/instance/render-helpers/index'
import { nextTick } from "../util/next-tick"

export function renderMixin (Vue) {
  installRenderHelpers(Vue.prototype)
  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  }
  Vue.prototype._render = function () {
    console.log('render')
    const { render } = this.$options
    const vnode = render.call(this)
    return vnode
  }
}

export function initRender (vm) {
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d)
}
