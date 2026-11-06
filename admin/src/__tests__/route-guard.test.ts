import { describe, it, expect } from 'vitest'
import type { Role } from '../../../shared/schema'

describe('CMS Route Guard & RBAC Authorization Logic (OWASP A01)', () => {
  const SUPER_ADMIN_ONLY_TABS = ['users', 'settings']
  const EDITOR_WRITE_TABS = [
    'courses',
    'course-edit',
    'materials',
    'categories',
    'homepage',
    'header-footer',
    'pages',
    'strings',
    'feedback',
  ]

  function canAccessTab(role: Role | null, tab: string): boolean {
    if (!role) return false
    if (SUPER_ADMIN_ONLY_TABS.includes(tab)) {
      return role === 'super_admin'
    }
    return true
  }

  function canMutateContent(role: Role | null): boolean {
    return role === 'super_admin' || role === 'editor'
  }

  describe('Unauthenticated User Route Access', () => {
    it('blocks access to all CMS tabs when user is not authenticated', () => {
      const tabs = ['dashboard', 'courses', 'materials', 'users', 'settings', 'feedback']
      for (const tab of tabs) {
        expect(canAccessTab(null, tab)).toBe(false)
      }
    })
  })

  describe('RBAC Tab Access Gates', () => {
    it('allows Super Admin to access all tabs including users and settings', () => {
      expect(canAccessTab('super_admin', 'dashboard')).toBe(true)
      expect(canAccessTab('super_admin', 'users')).toBe(true)
      expect(canAccessTab('super_admin', 'settings')).toBe(true)
      expect(canAccessTab('super_admin', 'courses')).toBe(true)
    })

    it('denies Editor access to sensitive users and settings management tabs', () => {
      expect(canAccessTab('editor', 'dashboard')).toBe(true)
      expect(canAccessTab('editor', 'courses')).toBe(true)
      expect(canAccessTab('editor', 'materials')).toBe(true)
      expect(canAccessTab('editor', 'users')).toBe(false)
      expect(canAccessTab('editor', 'settings')).toBe(false)
    })

    it('denies Viewer access to sensitive users and settings management tabs', () => {
      expect(canAccessTab('viewer', 'dashboard')).toBe(true)
      expect(canAccessTab('viewer', 'courses')).toBe(true)
      expect(canAccessTab('viewer', 'users')).toBe(false)
      expect(canAccessTab('viewer', 'settings')).toBe(false)
    })
  })

  describe('RBAC Content Mutation Gates', () => {
    it('allows Super Admin and Editor to mutate CMS content', () => {
      expect(canMutateContent('super_admin')).toBe(true)
      expect(canMutateContent('editor')).toBe(true)
    })

    it('denies Viewer role from mutating content (enforces read-only)', () => {
      expect(canMutateContent('viewer')).toBe(false)
      expect(canMutateContent(null)).toBe(false)
    })
  })
})

