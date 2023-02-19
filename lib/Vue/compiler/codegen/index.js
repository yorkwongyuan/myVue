export function generate (ast) {
  const code = ast ?
                ast.tag === 'script'
                ? 'null'
                : genElement(ast)
              : '_c("div")'
  return {
    render: `with(this){return ${code}}`
  }
}

export function genElement (el) {
  let data = genData(el)
  let code
  let tag
  if (el.tag) tag = `'${el.tag}'`
  const children = genChildren(el)
  code = `_c(${tag}${data ? `,${data}` : ''}${children ? `,${children}`: ''})`
  return code
}

function genNode (node) {
  if (node.type === 1) {
    return genElement(node)
  } else if (node.type === 3) {
    return `_v(${JSON.stringify(node.text)})`
  } else {
    return `_v(${node.expression})`
  }
}

function genChildren (el) {
  const children = el.children
  let gen = genNode
  return `[${children.map(item => gen(item)).join(',')}]`
}

function genData (el) {
  let data = '{'
  if (el.attrs) {
    data += `attrs:${genProps(el.attrs)}`
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
