import Vue from '../../../core/index'
import { mountComponent } from '../../../core/instance/lifecycle'
Vue.prototype.$mount = function (el) {
  if (typeof el === 'string') {
    el = document.querySelector(el)
  }
  mountComponent(this, el)
}

export default Vue
