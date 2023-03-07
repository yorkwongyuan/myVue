import {createCompilerToFunctionFn} from './to-function'
export function createCompilerCreator (baseCompile) {
  return function createCompiler (options){
    function compile (template) {
      const compiled = baseCompile(template, options)
      return compiled
    }
    return {
      compile,
      compileToFunctions: createCompilerToFunctionFn(compile)
    }
  }
}
