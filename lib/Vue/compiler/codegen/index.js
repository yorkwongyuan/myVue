import { genHandlers } from "./events"
class CodegenState {
  constructor (options) {
    this.directives = options.directives
  }
}

export function generate (ast, options) {
  let state = new CodegenState(options)
  const code = ast ?
                ast.tag === 'script'
                ? 'null'
                : genElement(ast, state)
              : '_c("div")'
  return {
    render: `with(this){return ${code}}`
  }
}

export function genElement (el, state) {
  let data = genData(el, state)
  let code
  let tag
  if (el.tag) tag = `'${el.tag}'`
  const children = genChildren(el, state)
  code = `_c(${tag}${data ? `,${data}` : ''}${children ? `,${children}`: ''})`
  return code
}

function genNode (node, state) {
  if (node.type === 1) {
    return genElement(node, state)
  } else if (node.type === 3) {
    return `_v(${JSON.stringify(node.text)})`
  } else {
    return `_v(${node.expression})`
  }
}

function genChildren (el, state) {
  const children = el.children
  let gen = genNode
  return `[${children.map(item => gen(item, state)).join(',')}]`
}

// 生成指令
function genDirectives (el, state) {
  // 获取指令
  const dirs = el.directives
  if (!dirs) return
  let res = 'directives:['
  let needRuntime = false
  let hasRuntime = false
  let i, l, name
  for (i = 0, l = dirs.length; i < l; i++) {
    const dir = dirs[i]
    name = dir.name
    const gen = state.directives[name]
    if (gen) {
      // model将v-model拆分为事件和属性
      needRuntime = !!gen(el, dir)
    }
    if (needRuntime) {
        hasRuntime = true
        res += `{name: "${dir.name}", rawName: "${dir.rawName}"${
          dir.value ? `,value: (${dir.value}), expression: ${JSON.stringify(dir.value)}` : ''
      }},`
    }
    if (needRuntime) {
      return res = res.slice(0, -1) + ']'
    }
  }
}

function genData (el, state) {
  let data = '{'
// 拆分指令
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','

  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)},`
  }

  // 生成属性
  if (el.props) {
    data += `domProps: ${genProps(el.props)},`
  }
  // 生成事件
  if (el.events) {
    data += `${genHandlers(el.events)},`
  }

  data = data.replace(/,$/, '') + '}'
  if (el.dynamicAttrs) {
    data = `_b(${data},"${el.tag}",${genProps(el.dynamicAttrs)})`
  }
  return data
}

function genProps (props) {
  let staticProps = ``
  let dynamicProps = ``
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    if (prop.dynamic) {
      dynamicProps += `${prop.name},${prop.value},`
    } else {
      staticProps += `"${prop.name}":${prop.value},`
    }
  }
  staticProps = `{${staticProps.slice(0, -1)}}`
  if (dynamicProps) {
    return `_d(${staticProps}, [${dynamicProps.slice(0, -1)}])`
  } else {
    return staticProps
  }
}
