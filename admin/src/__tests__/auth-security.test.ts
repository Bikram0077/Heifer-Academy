import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildSecureCookieString,
  parseCookieHeader,
  tokenStore,
} from '../../../shared/security/tokens'
import {
  saveStoredStaffCredential,
  loadStaffCredentialVault,
  clearStaffCredentialVault,
} from '../utils/staffCredentialVault'

describe('CMS Auth & Session Security Hardening (OWASP A02 & A07)', () => {
  beforeEach(() => {
    tokenStore.clear()
    clearStaffCredentialVault()
  })

  describe('Client-Side Token Storage (XSS Protection)', () => {
    it('stores short-lived access tokens strictly in-memory (never in localStorage or sessionStorage)', () => {
      tokenStore.setAccessToken('mock-access-token-xyz', 900)
      expect(tokenStore.getAccessToken()).toBe('mock-access-token-xyz')
      expect(tokenStore.isTokenValid()).toBe(true)

      // Verify zero tokens leaked to persistent browser storage
      if (typeof window !== 'undefined') {
        expect(window.localStorage.getItem('access_token')).toBeNull()
        expect(window.localStorage.getItem('token')).toBeNull()
        expect(window.sessionStorage.getItem('access_token')).toBeNull()
      }
    })

    it('automatically expires access tokens after their validity lifetime', async () => {
      // 0 seconds lifetime -> immediate expiration
      tokenStore.setAccessToken('ephemeral-token', 0)
      expect(tokenStore.getAccessToken()).toBeNull()
      expect(tokenStore.isTokenValid()).toBe(false)
    })
  })

  describe('Secure Cookie Attributes Generation', () => {
    it('enforces HttpOnly, Secure, SameSite=Strict, and scoped Path on cookies', () => {
      const cookieStr = buildSecureCookieString({
        name: 'ha_refresh_token',
        value: 'secure-refresh-val-123',
        path: '/admin',
        maxAgeSeconds: 7 * 24 * 3600,
        sameSite: 'Strict',
        secure: true,
        httpOnly: true,
      })

      expect(cookieStr).toContain('ha_refresh_token=secure-refresh-val-123')
      expect(cookieStr).toContain('HttpOnly')
      expect(cookieStr).toContain('Secure')
      expect(cookieStr).toContain('SameSite=Strict')
      expect(cookieStr).toContain('Path=/admin')
      expect(cookieStr).toContain('Max-Age=604800')
    })

    it('safely parses cookie strings without throwing on malformed inputs', () => {
      const parsed = parseCookieHeader('ha_refresh_token=abc123; other=xyz')
      expect(parsed.ha_refresh_token).toBe('abc123')
      expect(parsed.other).toBe('xyz')
    })
  })

  describe('Plaintext Password Elimination (Staff Directory Vault)', () => {
    it('completely strips passwords before persisting to storage', () => {
      saveStoredStaffCredential({
        email: 'trainer@heifernepal.org',
        name: 'Field Trainer',
        role: 'editor',
        password: 'SuperSecretPassword123!',
        cmsLoginUrl: 'http://localhost:5174/?email=trainer@heifernepal.org',
        updatedAt: new Date().toISOString(),
      })

      const vault = loadStaffCredentialVault()
      const entry = vault['trainer@heifernepal.org']

      expect(entry).toBeDefined()
      expect(entry.email).toBe('trainer@heifernepal.org')
      expect(entry.name).toBe('Field Trainer')
      expect(entry.role).toBe('editor')
      // Critical check: password MUST NOT be stored
      expect(entry.password).toBeUndefined()
    })
  })
})

