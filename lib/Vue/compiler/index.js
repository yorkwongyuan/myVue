import parse from './parse/index.js'
import { generate } from './codegen/index.js'
import { createCompilerCreator } from './create-compiler'

export const createCompiler = createCompilerCreator(
  function baseCompiler (template, options) {
    const ast = parse(template.trim(), options)
    const code = generate(ast, options)
    return {
      ast,
      render: code.render
    }
  }
)

