import parse from './parse/index.js'
import { generate } from './codegen/index.js'
import { createCompilerCreator } from './create-compiler'

export const createCompiler = createCompilerCreator(
  function baseCompiler (template, options) {
    console.log('🚀 ~ file: index.js:7 ~ baseCompiler ~ options:', options)
    const ast = parse(template.trim(), options)
    const code = generate(ast)
    return {
      ast,
      render: code.render
    }
  }
)

