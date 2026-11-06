import { describe, it, expect } from 'vitest'
import { validateSuperAdminPassword } from '../shared/security/passwordPolicy'
import {
  generateTotpSecret,
  generateTotpUri,
  generateTotpCode,
  verifyTotpCode,
} from '../shared/security/totp'
import { generateQrDataUrl, generateQrSvg } from '../shared/security/qr'

describe('Super Admin Password Complexity & Brute-Force Hardening', () => {
  it('rejects passwords shorter than 10 characters', () => {
    const res = validateSuperAdminPassword('Short1!a')
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Password must be at least 10 characters long.')
  })

  it('rejects passwords without uppercase letters', () => {
    const res = validateSuperAdminPassword('lowercaseonly123!@#')
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Password must contain at least one uppercase letter (A-Z).')
  })

  it('rejects passwords without numbers', () => {
    const res = validateSuperAdminPassword('NoNumbersHere!@#$')
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Password must contain at least one number (0-9).')
  })

  it('rejects passwords without special symbols', () => {
    const res = validateSuperAdminPassword('NoSpecialSymbols1234')
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Password must contain at least one special character (e.g. !@#$%^&*).')
  })

  it('rejects passwords containing common dictionary substrings', () => {
    const res1 = validateSuperAdminPassword('HeiferStrong2026!#')
    expect(res1.valid).toBe(false)
    expect(res1.errors.some((e) => e.includes('heifer'))).toBe(true)

    const res2 = validateSuperAdminPassword('SuperAdminKey2026!#')
    expect(res2.valid).toBe(false)
    expect(res2.errors.some((e) => e.includes('admin'))).toBe(true)
  })

  it('accepts compliant, high-entropy enterprise passwords', () => {
    const res = validateSuperAdminPassword('K@thmandu#Summit9824$')
    expect(res.valid).toBe(true)
    expect(res.errors.length).toBe(0)
    expect(res.score).toBeGreaterThanOrEqual(3)
  })
})

describe('Multi-Factor Authentication (MFA) Verification Logic', () => {
  it('validates 6-digit TOTP verification codes and strips whitespace', () => {
    const cleanTotp = (raw: string) => raw.trim().replace(/\s+/g, '')
    expect(cleanTotp(' 123 456 ')).toBe('123456')
    expect(/^\d{6}$/.test(cleanTotp(' 123 456 '))).toBe(true)
    expect(/^\d{6}$/.test(cleanTotp('12345'))).toBe(false) // too short
    expect(/^\d{6}$/.test(cleanTotp('1234567'))).toBe(false) // too long
    expect(/^\d{6}$/.test(cleanTotp('12345a'))).toBe(false) // non-numeric
  })

  it('generates compliant Base32 RFC 6238 TOTP secrets (32 characters / 160 bits)', () => {
    const secret = generateTotpSecret()
    expect(secret.length).toBe(32)
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true)

    // Supports custom length when specified
    const customSecret = generateTotpSecret(20)
    expect(customSecret.length).toBe(20)
    expect(/^[A-Z2-7]+$/.test(customSecret)).toBe(true)
  })

  it('generates standard otpauth:// URIs with proper query parameters', () => {
    const uri = generateTotpUri('admin@heifer.org', 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', 'Heifer Academy')
    expect(uri).toContain('otpauth://totp/Heifer%20Academy:admin%40heifer.org?')
    expect(uri).toContain('secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP')
    expect(uri).toContain('digits=6')
    expect(uri).toContain('period=30')
  })

  it('generates and verifies dynamic 6-digit TOTP codes with skew tolerance', async () => {
    const secret = generateTotpSecret(32)
    const now = Date.now()
    const code = await generateTotpCode(secret, now)
    expect(/^\d{6}$/.test(code)).toBe(true)

    // Current time
    const validCurrent = await verifyTotpCode(code, secret, { timestampMs: now })
    expect(validCurrent).toBe(true)

    // Window +/- 30s skew tolerance
    const validPastSkew = await verifyTotpCode(code, secret, { timestampMs: now + 25000 })
    expect(validPastSkew).toBe(true)

    // Beyond window skew rejected
    const expiredSkew = await verifyTotpCode(code, secret, { timestampMs: now + 120000 })
    expect(expiredSkew).toBe(false)

    // Invalid code rejected
    const invalid = await verifyTotpCode('000000', secret, { timestampMs: now })
    expect(invalid).toBe(false)
  })

  it('generates valid scannable PNG Data URLs and SVG QR codes', async () => {
    const uri = generateTotpUri('editor@heifer.org', 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP', 'Heifer Academy CMS')

    // Scannable PNG Base64 Data URL for Authenticator mobile apps
    const dataUrl = await generateQrDataUrl(uri, { width: 200 })
    expect(dataUrl.startsWith('data:image/png;base64,')).toBe(true)
    expect(dataUrl.length).toBeGreaterThan(100)

    // SVG rendering
    const svg = await generateQrSvg(uri, { width: 180 })
    expect(svg).toContain('<svg')
    expect(svg).toContain('viewBox=')
    expect(svg).toContain('</svg>')
  })
})


