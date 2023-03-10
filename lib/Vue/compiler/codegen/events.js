// 生成事件的render函数
export function genHandlers (events) {
  let staticHandlers = ``
  let dynamicHandlers = ``
  const prefix = 'on:'
  for (const name in events) {
    if (events[name] && events[name].dynamic) {
      dynamicHandlers += `${name}, ${genHandler(events[name])},`
    } else {
      staticHandlers += `"${name}": ${genHandler(events[name])},`
    }
  }
  staticHandlers = `{${staticHandlers.slice(0, -1)}}`
  if (dynamicHandlers) {
    return prefix + `_d(${staticHandlers}, [${dynamicHandlers.slice(0, -1)}])`
  } else {
    return prefix + staticHandlers
  }
}

function genHandler (handler) {
  if (!handler) return `function () {}`
  return `function ($event) {
    return ${handler.value}
  }`
}
