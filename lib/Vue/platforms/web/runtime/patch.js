import { createPatchFunction } from "../../../core/vdom/patch"
import * as nodeOps from './node-ops'
import baseModules from './modules/index'

const modules = baseModules

export const patch = createPatchFunction({nodeOps, modules})
