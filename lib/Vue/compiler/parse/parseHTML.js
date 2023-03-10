const cname = '[a-zA-Z_][\\-\\.a-zA-Z_0-9]*'
const capturename = `((?:${cname}\\:)?${cname})`

const startTagOpen = new RegExp(`^<${capturename}`)
// 动态方法正则
// let str = 'abaabaaab'
// let reg = /.+?b/
// 非贪婪模式: 只有ab, 如果没有问号, 那就是abaabaaab
const dynamicAttrs = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+?\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 静态方法正则
const staticAttrs = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
// 形如:  /> 或者 >
const startTagClose = /^\s*(\/?)>/
// 标签结束
const endTag = new RegExp(`^<\\/${capturename}[^>]*>`)
export default function parseHTML(html, options) {
  // 记录ast当中的开始和结束部分
  let index = 0
  let stack = []
  const isUnaryTag = options.isUnaryTag
  while (html) {
    let textEnd = html.indexOf('<')
    // <的index为0, 则很大可能性是一个标签
    if (textEnd === 0) {
      // 符合标签开始部分
      let match = parseStartTag()

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
          options.end(stack[i].tag, start, end)
        }
        stack.length = pos
      }

    }
    // 将前半个标签的match对象进一步加工, 主要是
    function handleStartTag (match) {
      const tagName = match.tag
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
          tag: tagName,
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
    function advance (n) {
      index += n
      html = html.substring(n)
    }
    // 其实做了两件事: 1. 生成match对象; 2. 搜集属性
    // 就是将一个带了属性的完整标签转换为一个对象
    function parseStartTag () {
      // <div 部分
      const start = html.match(startTagOpen)
      let match
      if (start) {
        match = {
          tag: start[1],
          attrs: [],
          start: index
        }
        advance(start[0].length)
        let end, attr
        // 取出属性部分
        while (
          !(end = html.match(startTagClose))
          &&
          ((attr = html.match(dynamicAttrs)) || (attr = html.match(staticAttrs)))) {
          attr.start = index
          advance(attr[0].length)
          attr.end = index
          match.attrs.push(attr)
        }
        if (end) {
          advance(end[0].length)
          match.end = index
        }
        return match
      }
    }
  }
}


