import { nextTick } from "../util/next-tick"
const queue = []
let has = {}
//
let waitting = false
// 是否正在更新中
let flushing = false
// 当前更新到的watcher的下标
let index = 0
// 更新队列
function flushSchedulerQueue () {
  flushing = true
  let watcher, id
  for (index = 0; index < queue.length; ++index) {
    watcher = queue[index]
    id = watcher.id
    // 置为null, 说明这个watcher的依赖如果再有变化,则可以更新
    has[id] = null
    // 最终执行更新
    watcher.run()
  }
  resetSchedulerState()
}

// 重置队列
function resetSchedulerState () {
  queue.length = 0
  waitting = flushing = false
}

// 添加watcher
export function queueWatcher (watcher) {
  const id = watcher.id
  // 如果已经记录了这个watcher, 则不再重复记录
  if (has[id]) {
    return
  }
  has[id] = true
  // 如果不是正在执行队列中的方法
  if (!flushing) {
    // 添加到watcher的队列中
    queue.push(watcher)
  // 如果正在执行队列中的watcher
  } else {
    const i = queue.length - 1
    // 后续的逻辑可以理解为:
    // 如果i已经是正在执行的watcher的下标了
    // 或者下标为i的watcher的id小于或等于当前传入的watcher.id
    // 则执行splice替换
    while (i > index && queue[i].id > watcher.id) {
      i--
    }
    queue.splice(i + 1, 0, watcher)
  }
  // 这里的waitting其实就是为了防止nextTick被重复执行
  // flushSchedulerQueue被执行后, 才会被重新置为false
  // 此处才能重新再执行一次nextTick
  if (!waitting) {
    waitting = true
    nextTick(flushSchedulerQueue)
  }
}
