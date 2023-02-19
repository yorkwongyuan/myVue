import { createElement } from "../vdom/create-element"
import {installRenderHelpers} from '../../core/instance/render-helpers/index'
export function renderMixin (Vue) {
  installRenderHelpers(Vue.prototype)
  Vue.prototype._render = function () {
    const { render } = this.$options
    console.log('🚀 ~ file: render.js:7 ~ renderMixin ~ render', render)
    const vnode = render.call(this)
    return vnode
  }
}

export function initRender (vm) {
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d)
}
