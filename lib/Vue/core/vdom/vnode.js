export default class VNode {
  /**
   *
   * @param tag 标签
   * @param data 属性
   * @param children 子vdom
   * @param text 文本
   * @param elm 真实节点
   * @param context 上下文
   */
  constructor (tag, data, children, text, elm, context) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.context = context
  }
}

export function createTextNode (val) {
  return new VNode(undefined, undefined, undefined, String(val))
}
