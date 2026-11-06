/**
 * Heifer Academy Security Suite — Input & HTML Sanitization Engine
 *
 * Protects against Stored/Reflected XSS, DOM Clobbering, Malicious URI schemes,
 * and Parameter Pollution across both Public and CMS applications.
 */

const DANGEROUS_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'applet',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'select',
  'textarea',
  'svg', // Prevent embedded XML/script payloads in SVG tags
  'math',
]

const DANGEROUS_ATTRIBUTES = [
  /^on[a-z]+/i, // Inline event handlers: onload, onerror, onclick, etc.
  /^formaction$/i,
  /^xlink:href$/i,
  /^fscommand$/i,
]

const CLOBBERING_ATTRIBUTES = ['id', 'name']
const CLOBBERING_NAMES = new Set([
  'nodename',
  'nodetype',
  'tagname',
  'attributes',
  'children',
  'firstchild',
  'lastchild',
  'ownerdocument',
  'parentnode',
  'parentelement',
  'hasattribute',
  'getattribute',
  'setattribute',
  'removeattribute',
  'classlist',
  'innerhtml',
  'outerhtml',
])

const DANGEROUS_SCHEME_REGEX = /^(?:javascript|vbscript|data|file):/i
const SAFE_SCHEME_REGEX = /^(?:https?:\/\/|mailto:|tel:|\/|#)/i

/**
 * Sanitizes an untrusted HTML string:
 * 1. Removes all dangerous and executable tags (script, iframe, object, embed, etc.)
 * 2. Strips all inline event handlers (onerror, onload, onclick, etc.)
 * 3. Strips javascript: and data: pseudo-protocols from attributes
 * 4. Neutralizes DOM clobbering identifiers (id, name)
 */
export function sanitizeHtml(rawHtml: string | undefined | null): string {
  if (!rawHtml || typeof rawHtml !== 'string') return ''

  let output = rawHtml

  // 1. Strip comments that could hide execution payloads
  output = output.replace(/<!--[\s\S]*?-->/g, '')

  // 2. Remove dangerous tags and their contents
  for (const tag of DANGEROUS_TAGS) {
    const tagRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi')
    output = output.replace(tagRegex, '')
    // Also remove self-closing or unclosed variants
    const selfClosing = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi')
    output = output.replace(selfClosing, '')
  }

  // 3. Process remaining tags and sanitize attributes
  output = output.replace(/<([a-z0-9]+)(\s+[^>]*)?>/gi, (fullMatch, tagName, attrString) => {
    const lowerTagName = tagName.toLowerCase()
    if (DANGEROUS_TAGS.includes(lowerTagName)) {
      return ''
    }

    if (!attrString) {
      return `<${lowerTagName}>`
    }

    // Parse attributes
    const cleanAttrs: string[] = []
    const attrRegex = /([a-z0-9_:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi
    let match: RegExpExecArray | null

    while ((match = attrRegex.exec(attrString)) !== null) {
      const attrName = match[1].toLowerCase()
      const attrVal = match[2] ?? match[3] ?? match[4] ?? ''

      // Strip on* event handlers
      if (DANGEROUS_ATTRIBUTES.some((r) => r.test(attrName))) {
        continue
      }

      // Check for DOM clobbering names
      if (CLOBBERING_ATTRIBUTES.includes(attrName)) {
        if (CLOBBERING_NAMES.has(attrVal.toLowerCase().trim())) {
          continue
        }
      }

      // Check URI schemes in href / src / action
      if (['href', 'src', 'action'].includes(attrName)) {
        const cleanedVal = attrVal.replace(/[\u0000-\u001F\u007F]/g, '').trim()
        if (DANGEROUS_SCHEME_REGEX.test(cleanedVal)) {
          continue
        }
      }

      cleanAttrs.push(`${attrName}="${encodeAttributeValue(attrVal)}"`)
    }

    return cleanAttrs.length > 0 ? `<${lowerTagName} ${cleanAttrs.join(' ')}>` : `<${lowerTagName}>`
  })

  return output
}

/**
 * Escapes characters inside HTML attribute values.
 */
function encodeAttributeValue(val: string): string {
  return val
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Strips ASCII control characters, trims whitespace, and bounds length.
 */
export function sanitizeInputText(raw: string | undefined | null, maxLength = 1000): string {
  if (!raw || typeof raw !== 'string') return ''
  // Strip control chars (excluding newline \n and tab \t if desired, or strip all)
  const cleaned = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
  return cleaned.slice(0, maxLength)
}

/**
 * Validates and sanitizes URL query parameters.
 * Rejects parameters containing protocol injection or script attempts.
 */
export function sanitizeQueryParams(
  params: Record<string, string | undefined | null>
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(params)) {
    if (val === undefined || val === null) continue
    const cleanKey = sanitizeInputText(key, 64)
    if (!cleanKey) continue
    const cleanVal = sanitizeInputText(val, 512)
    // Guard against javascript: or script injection in query params
    if (!DANGEROUS_SCHEME_REGEX.test(cleanVal) && !/<script/i.test(cleanVal)) {
      result[cleanKey] = cleanVal
    }
  }
  return result
}

/**
 * Returns true if URL has a safe scheme (http, https, mailto, tel, relative).
 */
export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false
  const trimmed = url.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (DANGEROUS_SCHEME_REGEX.test(trimmed)) return false
  return SAFE_SCHEME_REGEX.test(trimmed)
}
