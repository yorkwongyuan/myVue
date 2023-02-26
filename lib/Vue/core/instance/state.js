import { isFunction, noop } from '../../shared/util'
import { observe } from '../observer/index'

const sharePropertyDefinition = {
  enumertable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function initState (vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }
}

// 初始化data
function initData (vm) {
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm) : data
  console.log('🚀 ~ file: state.js:15 ~ initData ~ data', data)
  const keys = Object.keys(data)
  console.log('🚀 ~ file: state.js:25 ~ initData ~ keys', keys)
  let i = keys.length
  while (i--) {
    const key = keys[i]
    proxy(vm, '_data', key)
  }
  observe(data)
}

function proxy (target, sourceKey, key) {
  console.log('🚀 ~ file: state.js:34 ~ proxy ~ target, sourceKey, key', target, sourceKey, key)
  sharePropertyDefinition.get = function () {
    return target[sourceKey][key]
  }
  sharePropertyDefinition.set = function (value) {
    target[sourceKey][key] = value
  }
  Object.defineProperty(target, key, sharePropertyDefinition)
}
