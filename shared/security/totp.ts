/**
 * Heifer Academy Security Suite — RFC 6238 Compliant TOTP Engine
 *
 * Implements Time-based One-Time Password (TOTP) generation and verification
 * compatible with Google Authenticator, Authy, Microsoft Authenticator, and 1Password.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Generates a cryptographically secure Base32 secret key.
 * Default is 32 Base32 characters (160 bits / 20 bytes), which aligns with RFC 6238
 * recommendation and guarantees zero leftover bit ambiguity in mobile authenticator apps.
 */
export function generateTotpSecret(length = 32): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let secret = ''
  for (let i = 0; i < bytes.length; i++) {
    secret += BASE32_ALPHABET[bytes[i] % 32]
  }
  return secret
}

/**
 * Decodes a Base32 string into raw bytes.
 */
export function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const output: number[] = []

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i])
    if (idx === -1) continue

    value = (value << 5) | idx
    bits += 5

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return new Uint8Array(output)
}

/**
 * Generates the standard `otpauth://totp/...` URI for scanning into Authenticator apps.
 * Follows Google Authenticator Key URI Format:
 * otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}&digits=6&period=30
 */
export function generateTotpUri(
  accountEmail: string,
  secret: string,
  issuer = 'Heifer Academy'
): string {
  const cleanIssuer = issuer.trim()
  const cleanAccount = accountEmail.trim().toLowerCase()
  const encodedIssuer = encodeURIComponent(cleanIssuer)
  const encodedAccount = encodeURIComponent(cleanAccount)
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&digits=6&period=30`
}

/**
 * Computes a 6-digit TOTP code for a given timestamp using Web Crypto API HMAC-SHA1.
 */
export async function generateTotpCode(secret: string, timestampMs = Date.now()): Promise<string> {
  const keyBytes = base32Decode(secret)
  const timeStep = Math.floor(timestampMs / 1000 / 30)

  // 8-byte big-endian time buffer
  const timeBuffer = new ArrayBuffer(8)
  const timeView = new DataView(timeBuffer)
  timeView.setUint32(4, timeStep, false) // Lower 32 bits

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, timeBuffer)
  const hmac = new Uint8Array(signature)

  // Dynamic truncation (RFC 4226 / 6238)
  const offset = hmac[hmac.length - 1] & 0x0f
  const codeInt =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) >>> 0

  const code = (codeInt % 1000000).toString().padStart(6, '0')
  return code
}

/**
 * Verifies a 6-digit TOTP code against a secret key with time step skew tolerance (window).
 */
export async function verifyTotpCode(
  inputCode: string,
  secret: string,
  options: { window?: number; timestampMs?: number } = {}
): Promise<boolean> {
  const cleanCode = inputCode.trim().replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleanCode)) {
    return false
  }

  const window = options.window ?? 1 // Allows -1, 0, +1 time steps (90s window)
  const now = options.timestampMs ?? Date.now()

  for (let offset = -window; offset <= window; offset++) {
    const candidateTimestamp = now + offset * 30 * 1000
    const candidateCode = await generateTotpCode(secret, candidateTimestamp)
    if (candidateCode === cleanCode) {
      return true
    }
  }

  return false
}

