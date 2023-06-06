import { isFunction } from '../../shared/util'
import { pushTarget } from './dep'
import { queueWatcher } from './scheduler'

let uid = 0
export default class Watcher {
  constructor(vm, expOrFn) {
    this.vm = vm
    this.depIds = new Set()
    this.id = ++uid
    if (isFunction(expOrFn)) {
      this.getter = expOrFn
    }
    this.get()
  }
  get () {
    const vm = this.vm
    pushTarget(this)
    let value = ''
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      console.log(e.message)
    }
    return value
  }
  addDep (dep) {
    const id = dep.id
    if (!this.depIds.has(id)) {
      this.depIds.add(id)
      dep.addSub(this)
    }
  }
  update () {
    console.log('watcher.update')
    this.run()
    // queueWatcher(this)
  }
  run () {
    console.log('watcher.run')
    this.get()
  }
}
