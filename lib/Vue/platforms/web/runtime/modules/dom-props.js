// 更新属性
function updateDomProps (oldVnode, vnode) {
  console.log('🚀 ~ file: dom-props.js:3 ~ updateDomProps ~ vnode:', vnode)
  let props = vnode.data.domProps
  const elm = vnode.elm
  for (let key in props) {
    if (key === 'value') {
      console.log('设置', vnode)
      elm[key] = props[key]
    }
  }
}

export default {
  create: updateDomProps,
  update: updateDomProps,
}
