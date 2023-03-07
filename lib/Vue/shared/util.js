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

/**
 *
 * @param {String} str 传入的字符串参数, 如有多个, 以逗号隔开
 * @param {*} expectsLowerCase 是否将key转为小写
 * @returns
 */
export function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

