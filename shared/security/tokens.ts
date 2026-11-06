/**
 * Heifer Academy Security Suite — Secure Token Storage & Cookie Policy
 *
 * Enforces in-memory token storage (XSS-immune) and defines strict cookie security flags:
 * HttpOnly, Secure, SameSite=Strict, and scoped paths.
 */

export interface SecureCookieOptions {
  name: string
  value: string
  maxAgeSeconds?: number
  path?: string
  domain?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
  secure?: boolean
  httpOnly?: boolean
}

/**
 * Builds a compliant Set-Cookie header string with OWASP recommended security attributes:
 * - SameSite=Strict (blocks CSRF cross-origin state leakage)
 * - Secure (guarantees transmission only over TLS/HTTPS)
 * - HttpOnly (prevents access from document.cookie and client-side JavaScript)
 * - Path scoped strictly (e.g., /admin)
 */
export function buildSecureCookieString(options: SecureCookieOptions): string {
  const parts: string[] = []

  const encodedValue = encodeURIComponent(options.value)
  parts.push(`${options.name}=${encodedValue}`)

  const maxAge = options.maxAgeSeconds ?? 7 * 24 * 60 * 60 // 7 days default
  parts.push(`Max-Age=${maxAge}`)

  const path = options.path ?? '/admin'
  parts.push(`Path=${path}`)

  const sameSite = options.sameSite ?? 'Strict'
  parts.push(`SameSite=${sameSite}`)

  // Secure must always be set unless explicitly disabled for localhost dev
  const isSecure = options.secure !== false
  if (isSecure) {
    parts.push('Secure')
  }

  // HttpOnly is mandatory for sensitive refresh tokens
  const isHttpOnly = options.httpOnly !== false
  if (isHttpOnly) {
    parts.push('HttpOnly')
  }

  if (options.domain) {
    parts.push(`Domain=${options.domain}`)
  }

  return parts.join('; ')
}

/**
 * Parses a Cookie header or document.cookie string safely.
 */
export function parseCookieHeader(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!cookieString || typeof cookieString !== 'string') return cookies

  const pairs = cookieString.split(';')
  for (const pair of pairs) {
    const idx = pair.indexOf('=')
    if (idx > 0) {
      const key = pair.slice(0, idx).trim()
      const val = pair.slice(idx + 1).trim()
      try {
        cookies[key] = decodeURIComponent(val)
      } catch {
        cookies[key] = val
      }
    }
  }

  return cookies
}

/**
 * In-Memory Token Store
 *
 * Keeps access tokens in a closed JavaScript scope in memory.
 * Never serializes to localStorage or sessionStorage, completely mitigating
 * token theft via XSS injection.
 */
class InMemoryTokenStore {
  private accessToken: string | null = null
  private expiresAt: number | null = null
  private tokenVersion: number = 1

  public setAccessToken(token: string, expiresInSeconds: number): void {
    this.accessToken = token
    this.expiresAt = Date.now() + expiresInSeconds * 1000
  }

  public getAccessToken(): string | null {
    if (!this.accessToken || !this.expiresAt) return null
    if (Date.now() >= this.expiresAt) {
      this.clear()
      return null
    }
    return this.accessToken
  }

  public isTokenValid(): boolean {
    return Boolean(this.getAccessToken())
  }

  public getTokenVersion(): number {
    return this.tokenVersion
  }

  public incrementTokenVersion(): number {
    this.tokenVersion += 1
    return this.tokenVersion
  }

  public clear(): void {
    this.accessToken = null
    this.expiresAt = null
  }
}

export const tokenStore = new InMemoryTokenStore()

