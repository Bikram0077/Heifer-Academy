import { describe, it, expect } from 'vitest'
import {
  sanitizeHtml,
  sanitizeInputText,
  sanitizeQueryParams,
  isSafeUrl,
} from '../../shared/security/sanitize'

describe('Input & HTML Sanitization Suite (OWASP A03 Mitigation)', () => {
  describe('HTML Tag & Script Stripping', () => {
    it('completely removes <script> tags and executable payloads', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script><b>World</b>'
      const output = sanitizeHtml(input)
      expect(output).not.toContain('<script>')
      expect(output).not.toContain('alert("XSS")')
      expect(output).toContain('<p>Hello</p>')
      expect(output).toContain('<b>World</b>')
    })

    it('removes iframes, objects, embeds, and applets', () => {
      const input =
        '<iframe src="https://evil.com"></iframe><object data="malware.swf"></object><embed src="bad.pdf"/>'
      const output = sanitizeHtml(input)
      expect(output).not.toContain('<iframe')
      expect(output).not.toContain('<object')
      expect(output).not.toContain('<embed')
    })

    it('strips all inline event handlers (onload, onerror, onclick, onmouseover)', () => {
      const input =
        '<img src="valid.png" onload="alert(1)" onerror="fetch(\'//evil.com\')"/><a href="https://example.com" onclick="steal()">Click</a>'
      const output = sanitizeHtml(input)
      expect(output).not.toContain('onload')
      expect(output).not.toContain('onerror')
      expect(output).not.toContain('onclick')
      expect(output).not.toContain('alert(1)')
      expect(output).toContain('src="valid.png"')
    })

    it('neutralizes javascript: and data: pseudo-schemes in href and src attributes', () => {
      const input =
        '<a href="javascript:alert(document.cookie)">Bad Link</a><img src="data:text/html,<script>alert(1)</script>"/>'
      const output = sanitizeHtml(input)
      expect(output).not.toContain('javascript:')
      expect(output).not.toContain('data:text/html')
    })

    it('neutralizes DOM clobbering identifiers (id, name matching internal DOM properties)', () => {
      const input = '<div id="nodeName">Test</div><input name="attributes"/><form id="innerHTML"></form>'
      const output = sanitizeHtml(input)
      expect(output).not.toContain('id="nodeName"')
      expect(output).not.toContain('name="attributes"')
      expect(output).not.toContain('id="innerHTML"')
    })
  })

  describe('Input Text & Query Parameter Sanitization', () => {
    it('strips ASCII control characters from input text', () => {
      const input = 'Hello\u0000\u0007World\u001F!'
      expect(sanitizeInputText(input)).toBe('HelloWorld!')
    })

    it('bounds text to max length', () => {
      const longInput = 'A'.repeat(500)
      expect(sanitizeInputText(longInput, 100).length).toBe(100)
    })

    it('cleans malicious query parameters and rejects script attempts', () => {
      const dirty = {
        category: 'livestock',
        search: 'goat\u0000<script>alert(1)</script>',
        redirect: 'javascript:alert(1)',
      }
      const clean = sanitizeQueryParams(dirty)
      expect(clean.category).toBe('livestock')
      expect(clean.search).toBeUndefined()
      expect(clean.redirect).toBeUndefined()
    })

    it('validates safe URLs vs dangerous schemes', () => {
      expect(isSafeUrl('https://heifernepal.org')).toBe(true)
      expect(isSafeUrl('/#/courses')).toBe(true)
      expect(isSafeUrl('mailto:info@heifernepal.org')).toBe(true)
      expect(isSafeUrl('javascript:alert(1)')).toBe(false)
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false)
      expect(isSafeUrl('data:text/html,bad')).toBe(false)
    })
  })
})
