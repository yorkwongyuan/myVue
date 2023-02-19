export function createCompilerToFunctionFn (compile) {
  return function compilerToFunction (template) {
    const compiled = compile(template)
    let res = {}
    res.render = toFunction(compiled.render)
    return res
  }
}

function toFunction (code) {
  try {
    return new Function(code)
  } catch (e) {}
}
