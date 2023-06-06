import { isIE, isIOS, isNative } from "./env"
import { noop } from "../../shared/util"
const callbacks = []
let pending = false
let timerFunc

// 初始化定义异步方法
// 注意, 这里的逻辑总体是微任务优先
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // 在ios环境下, Promise.then的回调方法会出现被推入微任务队列后, 微任务队列一直不刷新的问题
    // 所以, 强制执行一个setTimeout, 其回调为一个空的方法
    if (isIOS) setTimeout(noop)
  }
// 如果Promise不存在, 则退而求其次使用MutationObserver
// IE11不支持MutationObserver
} else if (!isIE
  && typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
  // PhantomJS 和 IOS7.x环境下
  MutationObserver.toString() === '[object MutationObserverConstructor]')) {
    let counter = 1
    const observer = new MutationObserver(flushCallbacks)
    const textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = () => {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
// 如果mutationObserver在当前环境也不支持, 则使用setImmediate
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
// 如果以上微任务都不存在, 则使用setTimeout这个宏任务
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 执行callbacks中的所有方法
function flushCallbacks () {
  pending = false
  // 对数组进行浅拷贝, 这样, 即使callbacks被指为空, copies中的函数引用也仍然存在
  const copies = callbacks.slice(0)
  // 置空callbacks
  callbacks.length = 0
  for (let i = 0; i < copies.length; ++i) {
    copies[i]()
  }
}

export function nextTick (cb, ctx) {
  let _resolve
  // 将所有传入的方法放入callbacks队列中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        console.log(e.message)
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  // 如果此时已经不是pending状态了, 则可继续
  if (!pending) {
    pending = true
    // 执行异步方法
    timerFunc()
  }
  // 如果没有传入第一个参数, 则返回一个promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
