import parseHTML from './parseHTML.js'
import { parseText } from './text-parser.js'
let currentParent
let root
let stack = []
let dirRE = /^v-|^@|^:|^#/
let bindRE = /^v-bind:|^\\.|^:/
let dynamicArgRE = /^\[.*\]$/
export default function parse (template) {
  parseHTML(template, {
    start (tagName, attrs, unary, start, end) {
      // 1. 创建ast节点
      const element = createASTElement(tagName, attrs, currentParent)
      // 2. 定义currentParent
      currentParent = element
      if (!root) root = currentParent
      // 3. 存储stack
      stack.push(element)
    },
    chars (text, start, end) {
      const children = currentParent.children
      let child, res
      if (res = parseText(text)) {
        child = {
          type: 2,
          expression: res.expression,
          tokens: res.tokens
        }
      } else {
        child = {
          type: 3,
          text
        }
      }
      child.start = start
      child.end = end
      children.push(child)
    },
    end (tagName, start, end) {
      // 1. 确定当前结束的标签
      let element = stack[stack.length - 1]
      // 2. 删除栈内最后一个元素
      stack.length -= 1
      // 3. 确定currentParent
      currentParent = stack[stack.length - 1]
      closeElement(element)
    }
  })
  console.log(root, 'root')
  return root
}
// 解析节点的属性指令等等
// 并确定上下父子节点关系
function closeElement (el) {
  processAttrs(el)
  if (currentParent) {
    currentParent.children.push(el)
    el.parent = currentParent
  }
}

function processAttrs (el) {
  const lists = el.attrsList
  let isDynamic, i, l
  for ( i = 0, l = lists.length; i < l; i ++) {
    let name = lists[i].name
    let value = lists[i].value
    // 动态属性
    if (dirRE.test(name)) {
      if (bindRE.test(name)) {
        name = name.replace(bindRE, '')
        isDynamic = dynamicArgRE.test(name)
        // 是动态属性
        if (isDynamic) {
          name = name.slice(1, -1)
        }
        addAttrs(el, name, value, lists[i], isDynamic)
      }
    // 非动态属性
    } else {
      addAttrs(el, name, JSON.stringify(value), lists[i])
    }
  }
}

function addAttrs (el, name, value, range, dynamic) {
  const attrs = dynamic ?
    el.dynamicAttrs || (el.dynamicAttrs = []) : el.attrs || (el.attrs = [])
    attrs.push(rangeSetItem({name, value, dynamic}, range))
}

function rangeSetItem (item, range) {
  if (range) {
    if (range.start !== null) {
      item.start = range.start
    }
    if (range.end !== null) {
      item.end = range.end
    }
  }
  return item
}
// 创建AST节点
function createASTElement (tagName, attrs, parent) {
  return {
    type: 1,
    tag: tagName,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent,
    children: []
  }
}

function makeAttrsMap (attrsList) {
  let map = {}
  for (let i = 0, l = attrsList.length; i < l; i++) {
    map[attrsList[i].name] = attrsList[i].value
  }
  return map
}
