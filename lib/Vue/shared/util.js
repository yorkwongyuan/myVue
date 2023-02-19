// 判断是否为函数
export function isFunction (value) {
  return typeof value === 'function'
}

// 判断一个key是否属于一个对象
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (value, key) {
  return hasOwnProperty.call(value, key)
}

//
const _toString = Object.prototype.toString
export function isPlainObject (value) {
  return _toString.call(value) === '[object Object]'
}
export function isUndef (v) {
  return v === undefined || v === null
}
export function isDef (v) {
  return v !== undefined && v !== null
}

export const isArray = Array.isArray

export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

export function noop (a, b, c, d) {}

