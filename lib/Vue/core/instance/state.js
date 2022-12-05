import { isFunction } from '../../shared/util'
import { observe } from '../observer/index'
export function initState (vm) {
  const opts = vm.$options
  console.log('🚀 ~ file: state.js:411 ~ initState ~ vm', vm)
  if (opts.data) {
    initData(vm)
  }
}

// 初始化data
function initData (vm) {
  let data = vm.$options.data
  data = vm._data = isFunction(data) ? data.call(vm) : data
  observe(data)
}
