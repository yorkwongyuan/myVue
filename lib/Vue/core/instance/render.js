import { createElement } from "../vdom/create-element"
import {installRenderHelpers} from '../../core/instance/render-helpers/index'
export function renderMixin (Vue) {
  installRenderHelpers(Vue.prototype)
  Vue.prototype._render = function () {
    const { render } = this.$options
    const vnode = render.call(this)
    return vnode
  }
}

export function initRender (vm) {
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d)
}
