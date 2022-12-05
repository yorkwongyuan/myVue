let uid = 0
export default class Dep {
  static Target = null
  constructor () {
    this.id = uid++
    this.subs = []
  }
  addSub (sub) {
    this.subs.push(sub)
  }
  depend () {
    if (Dep.Target) {
      Dep.Target.addDep(this)
    }
  }
  notify () {
    const subs = this.subs.slice()
    for (let i = 0; i < subs.length; i++) {
      subs[i].update()
    }
  }
}

Dep.Target = null
export function pushTarget (target) {
  Dep.Target = target
}
