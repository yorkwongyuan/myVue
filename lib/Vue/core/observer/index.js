import { hasOwn, isPlainObject } from '../../shared/util'
import { def } from '../util/lang'
import Dep from './dep'
export function observe (value) {
  let ob = null
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else {
    ob = new Observer(value)
  }
  return ob
}

export class Observer {
  constructor (value) {
    def(value, '__ob__', this)
    if (isPlainObject(value)) {
      let keys = Object.keys(value)
      for (let i = 0; i < keys.length; i++) {
        defineReactive(value, keys[i])
      }
    }
  }
}

// 监听
export function defineReactive (obj, key, val) {
  const dep = new Dep()
  val = obj[key]
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get () {
      if (Dep.Target) {
        dep.depend()
      }
      return val
    },
    set (newVal) {
      val = newVal
      dep.notify()
    }
  })
}
