import VNode from "./vnode"
export function createElement (context, tag, data, children) {
  return _createElement(context, tag, data, children)
}

function _createElement (context, tag, data, children) {
  return new VNode(tag, data, children, undefined, undefined, context)
}
