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
  // // 用于存放已经处理了的节点
  // let stack = []
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
      // 符合结束标签
      // 结束的逻辑相对比较简单
      const endTagMatch = html.match(endTag)
      console.log('🚀 ~ file: parseHTML.js:37 ~ parseHTML ~ endTagMatch:', endTagMatch)
      if (endTagMatch) {
        let curIndex = index
        advance(endTagMatch[0].length)
        parseEndTag(endTagMatch[1], curIndex, index)
        continue
      }
    }
    /**
     * 代码执行到这里, 说明此时的html有4种情况:
     * 1. 类似于: 123</div>
     * 2. 类似于: 123<div>xxx</div>
     * 3. 类似于: <123</div>
     * 4. 类似于: 12<123</div>
     * 说白了, 就是从左起首个<, 可能是节点的一部分, 也可能是文本的一部分的问题;
     * 而这一步, 我们的目的是为了确保textEnd是从左开始, 最近的一个节点的<的下标值, 而不是文本!
     * 这样, 我们就可以通过html.substring(0, textEnd)来拿到真正的文本部分
     */
    let text
    if (textEnd >= 0) {
      /**
       * 注意下面这个rest, 根据上面我们说的4种情况, 我们可以推断出它的值
       * 1. html类似于: 123</div>, 则rest 为 </div>
       * 2. html类似于: 123<div>xxx</div>, 则rest 为 <div>xxx</div>
       * 3. html类似于: <123</div>, 则rest 为 <123</div>
       * 4. html类似于: 12<34<56</div>, 则rest 为 <34<56</div>
       * 说白了, rest此时可能是一个终止节点开头, 也可能是一段文本开头
       */
      let rest = html.slice(textEnd)
      let next
      /**
       * 从while的条件可以看出: 第1,2种情况首次就不会进入循环
       * 而能进入的, 只有3,4种情况了
       */
      while (!rest.match(startTagOpen) && !rest.match(endTag)) {
        // 注意, 这一步很关键, 它将获取此时的html从左起第二个<的位置!
        next = rest.indexOf('<', 1)
        if (next < 0) break
        // textEnd走到下一个<的位置
        textEnd += next
        // 此时再更新rest
        // 此时第3种情况都变成了</div>, 说明此时的textEnd已经可以拿到完整的文本部分了, 跳出循环;
        // 此时第4种情况都变成了<56</div>, 成为了之前第三种情况开始的样子, 所以继续while循环, 下一次, 它也能拿到文本并跳出;
        // 以此类推, 无论文本中有多少<都会被最终循环殆尽;
        rest = html.slice(textEnd)
        // 如果还有
      }
      // 这样, 我们就能用表示首个节点的<的下标值, 从而获取文本的部分
      text = html.substring(0, textEnd)
    }
    // 文本已经处理完, 从, html中截掉
    if (text) {
      advance(text.length)
    }
    // 处理文本部分
    if (options.chars && text) {
      options.chars(text, index - text.length, index)
    }
    // 解析结束的标签
    function parseEndTag (tagName, start, end) {
      // if (start === null) start = index
      // if (end === null) end = index
      // let pos
      // // 得出pos的值
      // if (tagName) {
      //   let lowerCasedTag = tagName.toLowerCase()
      //   for (pos = stack.length - 1; pos >= 0; pos--) {
      //     if(lowerCasedTag === stack[pos].lowerCasedTag) {
      //       break;
      //     }
      //   }
      // } else {
      //   pos = 0
      // }

      // if (pos >= 0) {
      //   for (let i = stack.length - 1; i >= pos; i--) {
      //     options.end(stack[i].tagName, start, end)
      //   }
      //   stack.length = pos
      // }
      options.end(tagName, start, end)
    }
    /**
     * handleStartTag主要做了两件事:
     * 1. 完善属性部分的数据
     * 2. 通过options.start来生成ast
     */
    function handleStartTag (match) {
      const tagName = match.tagName
      const l = match.attrs.length
      const attrs = new Array(l)
      const unary = isUnaryTag(tagName)
      // 处理属性
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
      // if (!unary) {
      //   // 将这个起始节点存入stack, 这里的目的, 是为了在处理结束节点, 后续会讲到
      //   stack.push({
      //     tagName: tagName,
      //     lowerCasedTag: tagName.toLowerCase(),
      //     attrs,
      //     start: match.start,
      //     end: match.end
      //   })
      // }
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


