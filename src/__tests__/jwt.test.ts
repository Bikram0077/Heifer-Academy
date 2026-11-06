import { describe, it, expect } from 'vitest'
import {
  signJwt,
  verifyJwt,
  parseJwt,
  validateAlgorithm,
  rotateRefreshToken,
  base64UrlEncode,
} from '../../shared/security/jwt'

describe('JWT Security Suite (RFC 7519 Compliant)', () => {
  const TEST_SECRET = 'heifer-academy-super-secure-hmac-key-2026-test-suite'

  describe('Algorithm Whitelist & Anti-alg:none Verification', () => {
    it('strictly rejects alg: none in all case variations (OWASP Top 10 mitigation)', async () => {
      const headerNone = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }))
      const headerNoneUpper = base64UrlEncode(JSON.stringify({ alg: 'NONE', typ: 'JWT' }))
      const headerNoneMixed = base64UrlEncode(JSON.stringify({ alg: 'None', typ: 'JWT' }))
      const payload = base64UrlEncode(
        JSON.stringify({ sub: 'attacker@evil.com', role: 'super_admin', exp: 9999999999 })
      )

      const token1 = `${headerNone}.${payload}.`
      const token2 = `${headerNoneUpper}.${payload}.`
      const token3 = `${headerNoneMixed}.${payload}.`

      const res1 = await verifyJwt(token1, TEST_SECRET)
      expect(res1.valid).toBe(false)
      expect(res1.error).toMatch(/none.*strictly prohibited/i)

      const res2 = await verifyJwt(token2, TEST_SECRET)
      expect(res2.valid).toBe(false)
      expect(res2.error).toMatch(/none.*strictly prohibited/i)

      const res3 = await verifyJwt(token3, TEST_SECRET)
      expect(res3.valid).toBe(false)
      expect(res3.error).toMatch(/none.*strictly prohibited/i)
    })

    it('rejects disallowed or unsupported algorithms (e.g. HS384, ES256, DES)', async () => {
      const header = { alg: 'ES256', typ: 'JWT' }
      expect(() => validateAlgorithm(header)).toThrow(/Disallowed JWT algorithm/i)
    })

    it('accepts whitelisted HS256 algorithm', () => {
      const header = { alg: 'HS256', typ: 'JWT' }
      expect(validateAlgorithm(header)).toBe('HS256')
    })
  })

  describe('Signature & Payload Integrity', () => {
    it('signs and verifies a valid token successfully', async () => {
      const token = await signJwt(
        { sub: 'editor@heifernepal.org', role: 'editor', tokenVersion: 1 },
        TEST_SECRET,
        { expiresInSeconds: 900 }
      )

      const result = await verifyJwt(token, TEST_SECRET)
      expect(result.valid).toBe(true)
      expect(result.verifiedToken?.payload.sub).toBe('editor@heifernepal.org')
      expect(result.verifiedToken?.payload.role).toBe('editor')
      expect(result.verifiedToken?.header.alg).toBe('HS256')
    })

    it('rejects tampered payload data when signature does not match', async () => {
      const validToken = await signJwt(
        { sub: 'editor@heifernepal.org', role: 'editor' },
        TEST_SECRET
      )
      const { header, signature } = parseJwt(validToken)
      const tamperedPayload = base64UrlEncode(
        JSON.stringify({ sub: 'editor@heifernepal.org', role: 'super_admin', exp: 9999999999 })
      )
      const tamperedToken = `${base64UrlEncode(JSON.stringify(header))}.${tamperedPayload}.${signature}`

      const result = await verifyJwt(tamperedToken, TEST_SECRET)
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/signature verification failed/i)
    })

    it('rejects malformed token strings with incorrect segments', async () => {
      const result = await verifyJwt('not.a.valid.jwt.token', TEST_SECRET)
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/invalid jwt structure/i)
    })
  })

  describe('Expiration & Lifetime Enforcement', () => {
    it('rejects expired tokens (exp in past)', async () => {
      const expiredToken = await signJwt(
        { sub: 'staff@heifernepal.org' },
        TEST_SECRET,
        { expiresInSeconds: -100 }
      )

      const result = await verifyJwt(expiredToken, TEST_SECRET)
      expect(result.valid).toBe(false)
      expect(result.error).toMatch(/token expired/i)
    })

    it('accepts tokens within the default 15-minute access window', async () => {
      const token = await signJwt(
        { sub: 'admin@heifernepal.org' },
        TEST_SECRET,
        { expiresInSeconds: 15 * 60 }
      )

      const result = await verifyJwt(token, TEST_SECRET)
      expect(result.valid).toBe(true)
    })
  })

  describe('Refresh Token Rotation & Version Invalidation', () => {
    it('atomically rotates refresh token, increments version, and invalidates old tokens', async () => {
      const initialVersion = 1
      const initialRefreshToken = await signJwt(
        { sub: 'super@heifernepal.org', role: 'super_admin', type: 'refresh' },
        TEST_SECRET,
        { tokenVersion: initialVersion, expiresInSeconds: 7 * 24 * 3600 }
      )

      const rotated = await rotateRefreshToken(initialRefreshToken, TEST_SECRET, initialVersion)
      expect(rotated.newVersion).toBe(2)
      expect(rotated.accessToken).toBeTruthy()
      expect(rotated.refreshToken).toBeTruthy()

      // The new access token must be valid under version 2
      const newAccessRes = await verifyJwt(rotated.accessToken, TEST_SECRET, {
        expectedTokenVersion: rotated.newVersion,
      })
      expect(newAccessRes.valid).toBe(true)

      // The old refresh token must be rejected under active version 2
      const oldTokenRes = await verifyJwt(initialRefreshToken, TEST_SECRET, {
        expectedTokenVersion: rotated.newVersion,
      })
      expect(oldTokenRes.valid).toBe(false)
      expect(oldTokenRes.error).toMatch(/token revoked/i)
    })
  })
})

