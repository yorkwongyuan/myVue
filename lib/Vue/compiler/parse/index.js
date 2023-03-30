import parseHTML from './parseHTML.js'
import { parseText } from './text-parser.js'
import { addDirective } from '../helpers'
let currentParent
let root
let stack = []
let dirRE = /^v-|^@|^:|^#/
let bindRE = /^v-bind:|^\\.|^:/
let dynamicArgRE = /^\[.*\]$/
export default function parse (template, options) {
  parseHTML(template, {
    isUnaryTag: options.isUnaryTag,
    start (tagName, attrs, unary, start, end) {
      // 1. 创建ast节点
      const element = createASTElement(tagName, attrs, currentParent)
      // 2. 定义root
      if (!root) root = element
      // 3. 存储stack或者执行结束
      // stack是用来改变currentParent的, input/img等不存在子节点, 也就无需用到stack
      if (!unary) {
        currentParent = element
        stack.push(element)
        // stack.forEach(st => {
        //   console.log('🚀 ~ file: index.js:27 ~ start ~ st:', st)
        // })
      } else {
        closeElement(element)
      }
    },
    chars (text, start, end) {
      // 获取当前父级节点的children属性
      const children = currentParent.children
      let child, res
      if (res = parseText(text)) {
        child = {
          type: 2,
          expression: res.expression,
          tokens: res.tokens
        }
      } else {
        // 暂时将其定为type:3
        child = {
          type: 3,
          text
        }
      }
      child.start = start
      child.end = end
      children.push(child)
    },
    end () {
      // 1. 确定当前结束的标签
      let element = stack[stack.length - 1]
      // 2. 删除栈内最后一个元素
      stack.length -= 1
      // 3. 更新currentParent
      currentParent = stack[stack.length - 1]
      closeElement(element)
    }
  })
  return root
}
// 解析节点的属性指令等等
// 并确定上下父子节点关系
function closeElement (element) {
  element = processElement(element)
  if (currentParent) {
    currentParent.children.push(element)
    element.parent = currentParent
  }
}
// 处理节点上的各种属性等
function processElement (element) {
  processAttrs(element)
  return element
}
// 处理属性/方法/指令
function processAttrs (element) {
  const lists = element.attrsList
  let isDynamic, i, l, name, rawName, value
  for ( i = 0, l = lists.length; i < l; i ++) {
    name = rawName = lists[i].name
    value = lists[i].value
    // 动态属性
    if (dirRE.test(name)) {
      // v-bind属性部分
      if (bindRE.test(name)) {
        name = name.replace(bindRE, '')
        isDynamic = dynamicArgRE.test(name)
        // 是动态属性
        if (isDynamic) {
          name = name.slice(1, -1)
        }
        addAttrs(element, name, value, lists[i], isDynamic)
      // 指令部分
      } else {
        // 获取指令名称, 例如:v-model的name为model
        name = name.replace(dirRE, '')
        addDirective(element, name, rawName, value)
      }
    // 非动态属性
    } else {
      addAttrs(element, name, JSON.stringify(value), lists[i])
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
