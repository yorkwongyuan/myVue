export function tagName (node) {
  return node.tagName
}

export function parentNode (node) {
  return node.parentNode
}

export function createElement (tag) {
  return document.createElement(tag)
}

export function appendChild (node, child) {
  node.appendChild(child)
}

export function createTextNode (text) {
  return document.createTextNode(text)
}

export function nextSibling (node) {
  return node.nextSibling
}

export function insertBefore (parent, child, ref) {
  parent.insertBefore(child, ref)
}

export function setTextContent (node, textContent) {
  node.textContent = textContent
}
