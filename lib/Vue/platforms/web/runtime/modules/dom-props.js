// 更新属性
function updateDomProps (oldVnode, vnode) {
  let props = vnode.data.domProps
  const elm = vnode.elm
  for (let key in props) {
    if (key === 'value') {
      elm[key] = props[key]
    }
  }
}

export default {
  create: updateDomProps,
  update: updateDomProps,
}
