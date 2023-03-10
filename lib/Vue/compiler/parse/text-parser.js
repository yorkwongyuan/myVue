const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export function parseText (text) {
  let tagRE = defaultTagRE
  if (!tagRE.test(text)) return
  tagRE.lastIndex = 0
  let match
  let tokens = []
  let rawTokens = []
  while (match = tagRE.exec(text)) {
    tokens.push(`_s(${match[1].trim()})`)
    rawTokens.push({'@binding': text})
  }
  return {
    tokens: rawTokens,
    expression: tokens.join('+')
  }
}
