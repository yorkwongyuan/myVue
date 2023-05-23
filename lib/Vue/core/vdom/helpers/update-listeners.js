// 这里其实是高度抽象化的方法, 具体执行逻辑, 都是外部传入的
export function updateListeners (on, add) {
  for (const name in on) {
    add && add(name, on[name])
  }
}
