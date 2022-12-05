export function def (obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    value: value,
    configurable: true,
    writable: true,
    enumerable: !!enumerable
  })
}
