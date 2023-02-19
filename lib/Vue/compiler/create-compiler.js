import {createCompilerToFunctionFn} from './to-function'
export function createCompilerCreator (baseCompile) {
  return function createCompiler (){
    function compile (template) {
      const compiled = baseCompile(template)
      return compiled
    }
    return {
      compile,
      compileToFunctions: createCompilerToFunctionFn(compile)
    }
  }
}
