const cname = '[a-zA-Z_][\\-\\.a-zA-Z_0-9]*'
const capturename = `((?:${cname}\\:)?${cname})`

const startTagOpen = new RegExp(`^<${capturename}`)
// 动态属性正则
const dynamicAttrs = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 静态方法正则
const staticAttrs = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 匹配起始标签的末端, 形如:  /> 或者 >等
const startTagClose = /^\s*(\/?)>/
// 匹配结束标签,形如:  </div>等
const endTag = new RegExp(`^<\\/${capturename}[^>]*>`)
export default function parseHTML(html, options) {
  // 当前执行到的位置
  let index = 0
  // 用于存放已经处理了的节点
  let stack = []
  // isUnaryTag, 判断是否是img/input这种不存在子节点的标签, 这种后续会另外判断
  const isUnaryTag = options.isUnaryTag
  // 循环html
  while (html) {
    let textEnd = html.indexOf('<')
    // 如果是<开头, 则可能是一个标签
    if (textEnd === 0) {
      // 判断此时html的开头是否是一个标签, 如果是, 就将其首个标签
      // 信息取出, parseStartTag逻辑见下方
      let match = parseStartTag()
      // 如能匹配到起始节点
      if (match) {
        // 将解析到的节点存入stack
        handleStartTag(match)
        continue
      }
      // 符合标签结束部分...
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        let curIndex = index
        advance(endTagMatch[0].length)
        parseEndTag(endTagMatch[1], curIndex, index)
        continue
      }
    }
    // 走到这里说明要么<不是第一个
    // 要么<是第一个但不是标签
    let text
    // 符合文本部分
    if (textEnd >= 0) {
      let rest = html.slice(textEnd)
      let next
      // 如果剩余部分既不符合开始的标签, 也不符合结束的标签
      // 这一步是为了确保文本部分被全部取出
      while (!rest.match(startTagOpen) && !rest.match(endTag)) {
        next = rest.indexOf('<', 1)
        if (next < 0) break
        textEnd += next
        rest = html.slice(textEnd)
      }
      text = html.substring(0, textEnd)
    }

    if (text) {
      advance(text.length)
    }
    // 处理文本部分
    if (options.chars && text) {
      options.chars(text, index - text.length, index)
    }
    // 解析结束的标签
    function parseEndTag (tagName, start, end) {
      if (start === null) start = index
      if (end === null) end = index
      let pos
      // 得出pos的值
      if (tagName) {
        let lowerCasedTag = tagName.toLowerCase()
        for (pos = stack.length - 1; pos >= 0; pos--) {
          if(lowerCasedTag === stack[pos].lowerCasedTag) {
            break;
          }
        }
      } else {
        pos = 0
      }

      if (pos >= 0) {
        for (let i = stack.length - 1; i >= pos; i--) {
          options.end(stack[i].tagName, start, end)
        }
        stack.length = pos
      }

    }
    /**
     *
     */
    function handleStartTag (match) {
      const tagName = match.tagName
      const l = match.attrs.length
      const attrs = new Array(l)
      const unary = isUnaryTag(tagName)
      // 将原本只是简单地match匹配加上start,end的属性对象转为以下形式对象:
      // 并矫正了start带空格的情况
      for (let i = 0; i < l; i ++) {
        const args = match.attrs[i]
        attrs[i] = {
          name: args[1],
          value: args[3] || args[4] || args[5],
          start: args.start + args[0].match(/^\s*/).length,
          end: args.end
        }
      }
      // 不可以是input/img这种节点, 因为这类节点没有子节点
      if (!unary) {
        // 这里倒是没做太多处理, 基本还是原来那个match对象;
        stack.push({
          tagName: tagName,
          lowerCasedTag: tagName.toLowerCase(),
          attrs,
          start: match.start,
          end: match.end
        })
      }
      if (options.start) {
        options.start(tagName, attrs, unary, match.start, match.end)
      }
    }
    // 只做两件事: 更新index, 截掉html已匹配完的部分
    function advance (n) {
      index += n
      html = html.substring(n)
    }
    // 其实做了两件事: 1. 生成match对象; 2. 搜集属性
    // 就是将一个带了属性的完整标签转换为一个对象
    function parseStartTag () {
      // <div 部分
      const start = html.match(startTagOpen)
      /**
       * start如有值: ['<div', 'div', index: 0, ....], 也就是, 第一项为匹配到的标签
       * 部分, 第二项是本标签的标签名
       */
      let match
      // 如能匹配到
      if (start) {
        match = {
          tagName: start[1], // 标签名
          attrs: [], // 属性, 初始化为空,后续会填充内容
          start: index // 当前匹配的起始位置
        }
        /**
         * 这一步很关键, 将start第一项, 也就是本次匹配到的内容, 从html中截掉
         * 同时增加index的数值
         */
        advance(start[0].length)
        let end, attr
        // 填充属性部分
        while (
          !(end = html.match(startTagClose))
          &&
          ((attr = html.match(dynamicAttrs)) || (attr = html.match(staticAttrs)))) {
          /**
           * 如果html是<div name="jack">123</div>
           * 那么这里的attr的形式大体将是: [' name="jack"', 'name', '=', 'jack', ...]
          */
          attr.start = index // 属性匹配起始部分
          advance(attr[0].length) // 更新index, 并将已经匹配到的部分从html中截掉
          attr.end = index // 属性匹配结束部分
          match.attrs.push(attr) // 将匹配到的属性填充到attrs中
        }
        // 如果此时开头是‘>’或者‘/>’, 则说明属性已经被处理完毕
        if (end) {
          advance(end[0].length)
          /**
           * 设置本节点的结束位置, 注意, 这里的结束位置仅仅是起始标签结束的位置
           * 例如: <div>123</div>中<div>结束的位置, 也就是5(这里的位置是从1开始算起的,不是0)
           */
          match.end = index
        }
        /**
         * 此时的match, 大体像这样:
         * {
         *    tagName: 'div',
         *    start: 0,
         *    end: 5,
         *    attrs: [[' name="jack"', 'name', '=', 'jack', ...]]
         * }
         */
        return match
      }
    }
  }
}


