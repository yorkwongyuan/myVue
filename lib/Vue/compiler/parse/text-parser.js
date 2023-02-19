const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
export function parseText (text) {
  console.log('🚀 ~ file: text-parser.js:3 ~ parseText ~ text', text)
  let tagRE = defaultTagRE
  if (!tagRE.test(text)) return
  tagRE.lastIndex = 0
  let match
  let tokens = []
  let rawTokens = []
  while (match = tagRE.exec(text)) {
    console.log('🚀 ~ file: text-parser.js:7 ~ parseText ~ match', match)
    tokens.push(`_s(${match[1].trim()})`)
    rawTokens.push({'@binding': text})
  }
  return {
    tokens: rawTokens,
    expression: tokens.join('+')
  }
}
