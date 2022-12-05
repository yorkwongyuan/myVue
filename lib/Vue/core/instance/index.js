import { initMixin } from './init'
export default function Vue (options) {
  this._init(options)
}

initMixin(Vue)

