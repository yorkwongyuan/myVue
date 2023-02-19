import parse from './parse/index.js'
import { generate } from './codegen/index.js'
import { createCompilerCreator } from './create-compiler'

export const createCompiler = createCompilerCreator(
  function baseCompiler (template) {
    const ast = parse(template.trim())
    console.log('🚀 ~ file: index.js:8 ~ baseCompiler ~ ast', ast)
    const code = generate(ast)
    return {
      ast,
      render: code.render
    }
  }
)

