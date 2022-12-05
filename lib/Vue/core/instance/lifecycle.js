import Watcher from '../observer/watcher'
export function mountComponent (vm, el) {
  const updateComponent = function () {
    console.log('更新后的', vm._data.name)
    el.innerHTML = vm._data.name
  }
  new Watcher(vm, updateComponent)
}
