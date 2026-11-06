import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { LoginPage } from '../pages/LoginPage'
import { AlertCircleIcon, RefreshIcon, ShieldCheckIcon } from './icons'
import heiferLogoLight from '@siteAssets/heifer-academy-logo-light.png'
import type { AdminTab } from './AdminLayout'

interface AdminRouteGuardProps {
  currentTab: AdminTab
  children: ReactNode
}

const SUPER_ADMIN_ONLY_TABS: AdminTab[] = ['users', 'settings']

/**
 * Enterprise Route Guard & Authorization Gate
 *
 * Guarantees:
 * 1. Zero state leakage: Unauthenticated users are redirected to LoginPage before any admin DOM/state mounts.
 * 2. Disabled account revocation: Disabled staff profiles are instantly revoked.
 * 3. Role-Based Access Control (RBAC): Tabs restricted to Super Admin cannot be viewed by editors or viewers.
 */
export function AdminRouteGuard({ currentTab, children }: AdminRouteGuardProps) {
  const { user, profile, loading, isBootstrapped, isSuperAdmin, logout } = useAuth()

  // 1. Loading state with zero leakage
  if (loading || isBootstrapped === null) {
    return (
      <div
        data-testid="admin-guard-loading"
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-4 text-center"
      >
        <div className="rounded-2xl border border-line bg-card p-6 shadow-card">
          <img src={heiferLogoLight} alt="Heifer Academy" className="mx-auto h-10 w-auto" />
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-brand uppercase">
            <RefreshIcon size={15} className="animate-spin text-accent-500" />
            Verifying staff credentials...
          </div>
        </div>
      </div>
    )
  }

  // 2. Authentication Gate: Unauthenticated users are strictly barred
  if (!user || !profile) {
    return <LoginPage />
  }

  // 3. Disabled Account Gate
  if (profile.disabled) {
    return (
      <div
        data-testid="admin-guard-disabled"
        className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4"
      >
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-900 shadow-card">
          <AlertCircleIcon size={32} className="mx-auto text-red-600" />
          <h2 className="mt-3 text-lg font-bold">Access Suspended</h2>
          <p className="mt-2 text-xs text-red-700">
            This administrator account has been deactivated by a Super Admin. Please contact your
            system administrator if you believe this is in error.
          </p>
          <button
            type="button"
            onClick={() => void logout('/admin/login')}
            className="mt-5 rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // 4. Role-Based Access Control (RBAC) Tab Gate
  if (SUPER_ADMIN_ONLY_TABS.includes(currentTab) && !isSuperAdmin) {
    return (
      <div
        data-testid="admin-guard-unauthorized"
        className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"
      >
        <div className="max-w-md rounded-2xl border border-amber-200 bg-card p-6 shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
            <ShieldCheckIcon size={24} />
          </div>
          <h2 className="mt-4 text-base font-bold text-ink">Restricted Section</h2>
          <p className="mt-2 text-xs text-ink-2">
            The <span className="font-semibold text-ink uppercase tracking-wider">{currentTab}</span> area
            is restricted exclusively to Super Administrators. Your active role is{' '}
            <span className="font-semibold text-brand uppercase tracking-wider">
              {profile.role.replace('_', ' ')}
            </span>
            .
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
