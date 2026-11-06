/**
 * Heifer Academy Security Suite — RFC 7519 Compliant JWT Engine
 *
 * Implements strict algorithm enforcement, anti-alg:none protection,
 * short-lived access token validation, and token rotation verification.
 */

export const ALLOWED_ALGORITHMS = ['HS256', 'RS256'] as const
export type AllowedAlgorithm = (typeof ALLOWED_ALGORITHMS)[number]

/** Default access token maximum lifetime: 15 minutes (900 seconds) */
export const DEFAULT_ACCESS_TOKEN_LIFETIME_SEC = 15 * 60

/** Maximum clock skew tolerance: 30 seconds */
export const CLOCK_TOLERANCE_SEC = 30

export interface JwtHeader {
  alg: string
  typ?: string
  kid?: string
  [key: string]: unknown
}

export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  role?: string
  tokenVersion?: number
  [key: string]: unknown
}

export interface VerifiedJwt {
  header: JwtHeader
  payload: JwtPayload
  signature: string
}

export interface TokenValidationResult {
  valid: boolean
  error?: string
  verifiedToken?: VerifiedJwt
}

export interface SignTokenOptions {
  algorithm?: AllowedAlgorithm
  expiresInSeconds?: number
  issuer?: string
  audience?: string
  tokenVersion?: number
}

export interface VerifyTokenOptions {
  allowedAlgorithms?: AllowedAlgorithm[]
  issuer?: string
  audience?: string
  expectedTokenVersion?: number
  currentTimestamp?: number
}

// ==========================================
// Base64URL Encoding & Decoding Helpers
// ==========================================

export function base64UrlEncode(buffer: ArrayBuffer | Uint8Array | string): string {
  let bytes: Uint8Array
  if (typeof buffer === 'string') {
    bytes = new TextEncoder().encode(buffer)
  } else if (buffer instanceof Uint8Array) {
    bytes = buffer
  } else {
    bytes = new Uint8Array(buffer)
  }

  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }

  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) {
    base64 += '='
  }
  const binary = typeof atob === 'function' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary')
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function base64UrlDecodeString(str: string): string {
  const bytes = base64UrlDecode(str)
  return new TextDecoder().decode(bytes)
}

// ==========================================
// Parsing & Algorithm Whitelist Validation
// ==========================================

/**
 * Parses a raw JWT string into its three components without verifying the signature.
 * Rejects structurally invalid tokens immediately.
 */
export function parseJwt(token: string): {
  header: JwtHeader
  payload: JwtPayload
  signature: string
  signingInput: string
} {
  if (typeof token !== 'string') {
    throw new Error('Token must be a non-empty string')
  }

  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error(`Invalid JWT structure: expected 3 parts separated by dots, got ${parts.length}`)
  }

  const [rawHeader, rawPayload, signature] = parts

  let header: JwtHeader
  let payload: JwtPayload
  try {
    header = JSON.parse(base64UrlDecodeString(rawHeader))
  } catch {
    throw new Error('Invalid JWT header: failed to parse JSON')
  }

  try {
    payload = JSON.parse(base64UrlDecodeString(rawPayload))
  } catch {
    throw new Error('Invalid JWT payload: failed to parse JSON')
  }

  return {
    header,
    payload,
    signature,
    signingInput: `${rawHeader}.${rawPayload}`,
  }
}

/**
 * Strictly verifies algorithm compliance:
 * 1. Checks that alg is present and non-empty.
 * 2. Explicitly rejects 'none' (in any case: 'none', 'None', 'NONE').
 * 3. Enforces that alg is an explicit member of the allowed algorithm whitelist.
 */
export function validateAlgorithm(
  header: JwtHeader,
  allowedAlgorithms: AllowedAlgorithm[] = [...ALLOWED_ALGORITHMS]
): AllowedAlgorithm {
  const alg = header.alg

  if (!alg || typeof alg !== 'string') {
    throw new Error('Missing or invalid algorithm in JWT header')
  }

  const lowerAlg = alg.toLowerCase().trim()

  // Critical OWASP Protection: Explicit rejection of 'none' algorithm
  if (lowerAlg === 'none') {
    throw new Error('CRITICAL SECURITY VIOLATION: Unsigned "none" algorithm is strictly prohibited')
  }

  if (!allowedAlgorithms.includes(alg as AllowedAlgorithm)) {
    throw new Error(
      `Disallowed JWT algorithm: "${alg}". Whitelisted algorithms: ${allowedAlgorithms.join(', ')}`
    )
  }

  return alg as AllowedAlgorithm
}

// ==========================================
// Web Crypto Signature Verification
// ==========================================

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyData = enc.encode(secret)
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

/**
 * Signs a payload using Web Crypto HMAC-SHA256 (HS256).
 */
export async function signJwt(
  payload: JwtPayload,
  secret: string,
  options: SignTokenOptions = {}
): Promise<string> {
  const algorithm: AllowedAlgorithm = options.algorithm || 'HS256'
  if (algorithm !== 'HS256') {
    throw new Error(`signJwt currently supports HS256 for symmetric signing, got ${algorithm}`)
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = options.expiresInSeconds ?? DEFAULT_ACCESS_TOKEN_LIFETIME_SEC

  const fullHeader: JwtHeader = {
    alg: 'HS256',
    typ: 'JWT',
  }

  const fullPayload: JwtPayload = {
    ...payload,
    iat: payload.iat ?? now,
    exp: payload.exp ?? now + expiresIn,
  }

  if (options.issuer) fullPayload.iss = options.issuer
  if (options.audience) fullPayload.aud = options.audience
  if (options.tokenVersion !== undefined) fullPayload.tokenVersion = options.tokenVersion

  const encodedHeader = base64UrlEncode(JSON.stringify(fullHeader))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await getHmacKey(secret)
  const signatureBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  const signature = base64UrlEncode(signatureBytes)

  return `${signingInput}.${signature}`
}

/**
 * Fully verifies a JWT:
 * 1. Validates 3-part structure.
 * 2. Checks header and rejects alg:none / unapproved algorithms.
 * 3. Verifies cryptographic signature using HMAC-SHA256.
 * 4. Verifies expiration (exp) and not-before (nbf) with clock tolerance.
 * 5. Verifies issuer and audience if specified.
 * 6. Verifies tokenVersion if specified (for token invalidation/rotation).
 */
export async function verifyJwt(
  token: string,
  secret: string,
  options: VerifyTokenOptions = {}
): Promise<TokenValidationResult> {
  try {
    const { header, payload, signature, signingInput } = parseJwt(token)

    // 1. Algorithm Whitelist Enforcement
    const allowed = options.allowedAlgorithms || [...ALLOWED_ALGORITHMS]
    const alg = validateAlgorithm(header, allowed)

    // 2. Cryptographic Signature Verification
    if (alg === 'HS256') {
      const key = await getHmacKey(secret)
      const sigBytes = base64UrlDecode(signature)
      const dataBytes = new TextEncoder().encode(signingInput)
      const validSig = await crypto.subtle.verify(
        'HMAC',
        key,
        sigBytes as unknown as BufferSource,
        dataBytes as unknown as BufferSource
      )

      if (!validSig) {
        return { valid: false, error: 'Signature verification failed: invalid token signature' }
      }
    } else {
      return { valid: false, error: `Verification for ${alg} requires RS256 public key` }
    }

    // 3. Claims Verification
    const now = options.currentTimestamp ?? Math.floor(Date.now() / 1000)

    // Expiration check
    if (typeof payload.exp === 'number') {
      if (now > payload.exp + CLOCK_TOLERANCE_SEC) {
        return { valid: false, error: `Token expired at timestamp ${payload.exp} (current: ${now})` }
      }
    } else {
      return { valid: false, error: 'Token missing required "exp" expiration claim' }
    }

    // Not-before check
    if (typeof payload.nbf === 'number') {
      if (now < payload.nbf - CLOCK_TOLERANCE_SEC) {
        return { valid: false, error: `Token not valid before timestamp ${payload.nbf} (current: ${now})` }
      }
    }

    // Issuer check
    if (options.issuer && payload.iss !== options.issuer) {
      return { valid: false, error: `Issuer mismatch: expected ${options.issuer}, got ${payload.iss}` }
    }

    // Audience check
    if (options.audience) {
      const aud = payload.aud
      const matches = Array.isArray(aud) ? aud.includes(options.audience) : aud === options.audience
      if (!matches) {
        return { valid: false, error: `Audience mismatch: expected ${options.audience}, got ${aud}` }
      }
    }

    // Token Version / Invalidation check
    if (options.expectedTokenVersion !== undefined) {
      const version = payload.tokenVersion ?? 0
      if (version < options.expectedTokenVersion) {
        return {
          valid: false,
          error: `Token revoked: tokenVersion ${version} is older than active version ${options.expectedTokenVersion}`,
        }
      }
    }

    return {
      valid: true,
      verifiedToken: {
        header,
        payload,
        signature,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    return { valid: false, error: message }
  }
}

// ==========================================
// Token Rotation Engine
// ==========================================

export interface RotatedTokens {
  accessToken: string
  refreshToken: string
  newVersion: number
}

/**
 * Performs atomic refresh token rotation:
 * 1. Validates the old refresh token.
 * 2. Increments the token version to revoke all previously issued access tokens.
 * 3. Returns a newly minted short-lived access token (15 mins) and a new refresh token.
 */
export async function rotateRefreshToken(
  oldRefreshToken: string,
  secret: string,
  currentTokenVersion: number,
  options: {
    accessTokenLifetimeSec?: number
    refreshTokenLifetimeSec?: number
    issuer?: string
  } = {}
): Promise<RotatedTokens> {
  const result = await verifyJwt(oldRefreshToken, secret, {
    expectedTokenVersion: currentTokenVersion,
    issuer: options.issuer,
  })

  if (!result.valid || !result.verifiedToken) {
    throw new Error(`Refresh token rotation failed: ${result.error || 'Invalid refresh token'}`)
  }

  const { payload } = result.verifiedToken
  const newVersion = currentTokenVersion + 1

  const accessToken = await signJwt(
    {
      sub: payload.sub,
      role: payload.role,
      type: 'access',
      tokenVersion: newVersion,
    },
    secret,
    {
      expiresInSeconds: options.accessTokenLifetimeSec ?? DEFAULT_ACCESS_TOKEN_LIFETIME_SEC,
      issuer: options.issuer,
    }
  )

  const refreshToken = await signJwt(
    {
      sub: payload.sub,
      role: payload.role,
      type: 'refresh',
      tokenVersion: newVersion,
    },
    secret,
    {
      expiresInSeconds: options.refreshTokenLifetimeSec ?? 7 * 24 * 60 * 60, // 7 days
      issuer: options.issuer,
    }
  )

  return {
    accessToken,
    refreshToken,
    newVersion,
  }
}
