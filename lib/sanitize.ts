import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's',
  'ul', 'ol', 'li', 'h2', 'h3', 'h4',
  'a', 'blockquote', 'code', 'pre',
  'span', 'div', 'table', 'tr', 'td', 'th',
]

const ALLOWED_ATTR = [
  'href', 'target', 'rel',
  'class', 'id', 'style',
]

const FORBIDDEN_ATTR = [
  'onerror', 'onload', 'onclick',
  'onmouseover', 'onfocus', 'onblur',
]

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_ATTR: FORBIDDEN_ATTR,
  })
}

export function sanitizeText(dirty: string | null | undefined): string {
  if (!dirty) return ''
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  })
}
