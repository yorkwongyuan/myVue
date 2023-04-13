import { createPatchFunction } from "../../../core/vdom/patch"
// 对节点的操作方法
import * as nodeOps from './node-ops'
// 对属性/事件等模块的操作方法
import baseModules from './modules/index'

const modules = baseModules
// 创建patch方法
export const patch = createPatchFunction({nodeOps, modules})
