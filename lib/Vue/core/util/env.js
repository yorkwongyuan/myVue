export const inBrowser = typeof window !== 'undefined'
export const UA = inBrowser && window.navigator.userAgent.toLowerCase()
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA)
export const isIE = UA && /msie|trident/.test(UA)
export function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
}
