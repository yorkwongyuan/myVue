import {genAssignmentCode} from '../../../../compiler/directives/model'
import {addProp, addHandler} from '../../../../compiler/helpers'

export default function model (el, dir) {
  const tag = el.tag
  const value = dir.value
  if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value)
  }
  return true
}

function genDefaultModel (el, value) {
  let valueExpression = '$event.target.value'
  let code = genAssignmentCode(value, valueExpression)
  const event = 'input' // 暂时写死为input
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code)
}
