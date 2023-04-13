import { createCompiler } from '../../../compiler/index'
import {baseOptions} from './options'
export const { compileToFunctions, compile } = createCompiler(baseOptions)
