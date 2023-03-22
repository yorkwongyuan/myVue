import { isFunction, noop } from '../../shared/util'
import { observe } from '../observer/index'
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
   // 如data是一个方法, 则执行, 获取其返回的对象, 如是对象, 则直接返回
   data = vm._data = isFunction(data) ? data.call(vm) : data
   const keys = Object.keys(data)
   let i = keys.length
   // 遍历data对象上的值
   while (i--) {
     const key = keys[i]
     proxy(vm, '_data', key)
   }
  observe(data)
}

const sharePropertyDefinition = {
  enumertable: true,
  configurable: true,
  get: noop,
  set: noop
}

// 代理方法, 在这一步中, 是将this.xx代理到this._data.xx!
function proxy (target, sourceKey, key) {
  sharePropertyDefinition.get = function () {
    return target[sourceKey][key]
  }
  sharePropertyDefinition.set = function (value) {
    target[sourceKey][key] = value
  }
  Object.defineProperty(target, key, sharePropertyDefinition)
}
