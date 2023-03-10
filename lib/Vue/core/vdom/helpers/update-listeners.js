// 这里其实是高度抽象化的方法, 具体执行逻辑, 都是外部传入的
export function updateListeners (on, add) {
  console.log('🚀 ~ file: update-listeners.js:3 ~ updateListeners ~ on:', on)
  for (const name in on) {
    add(name, on[name])
  }
}
