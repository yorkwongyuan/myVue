export function addDirective (el, name, rawName, value) {
  ;(el.directives || (el.directives = [])).push({
    name,
    rawName,
    value,
  })
}

export function addProp (el, name, value) {
  ;(el.props || (el.props = [])).push({
    name,
    value
  })
}

// 添加事件
export function addHandler (el, name, value) {
  let events = (el.events || (el.events = {}))
  events[name] = {value: value}
}

