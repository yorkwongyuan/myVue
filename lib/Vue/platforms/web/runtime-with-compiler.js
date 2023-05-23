import { compileToFunctions } from './compiler/index'
import Vue from './runtime/index'
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el) {
  const options = this.$options
  const template = options.template
  const { render } = compileToFunctions(template.trim())
  options.render = render
  mount.call(this, el)
}

export default Vue
