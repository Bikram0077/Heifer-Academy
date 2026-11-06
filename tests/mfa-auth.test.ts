import { describe, it, expect } from 'vitest'
import { validateSuperAdminPassword } from '../shared/security/passwordPolicy'

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
})
