import {createCompilerToFunctionFn} from './to-function'
export function createCompilerCreator (baseCompile) {
  return function createCompiler (options){
    function compile (template) {
      const compiled = baseCompile(template, options)
      console.log('🚀 ~ file: create-compiler.js:6 ~ compile ~ compiled:', compiled)
      return compiled
    }
    return {
      compile,
      compileToFunctions: createCompilerToFunctionFn(compile)
    }
  }
}
