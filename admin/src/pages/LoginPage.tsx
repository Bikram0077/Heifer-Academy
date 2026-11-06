import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLoginRateLimiter } from '../hooks/useLoginRateLimiter'
import heiferLogoLight from '@siteAssets/heifer-academy-logo-light.png'
import heiferLogoDark from '@siteAssets/heifer-academy-logo-dark.png'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  LogOutIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from '../components/icons'

type Mode = 'login' | 'bootstrap' | 'invite' | 'reset'

export function LoginPage() {
  const {
    user,
    profile,
    isBootstrapped,
    hasPendingInvite,
    login,
    logout,
    bootstrapSuperAdmin,
    completeBootstrapForCurrentUser,
    signupWithInvite,
    claimInviteForCurrentUser,
    resetPassword,
    mfaChallengeRequired,
    isMfaVerified,
    resolveMfaWithCode,
    cancelMfaChallenge,
    error,
    clearError,
  } = useAuth()

  const initialParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const queryEmail = initialParams?.get('email')?.trim() || ''
  const queryInvite = initialParams?.get('invite') === '1'

  const [mode, setMode] = useState<Mode>(() => {
    if (isBootstrapped === false) return 'bootstrap'
    if (queryInvite) return 'invite'
    return 'login'
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState(queryEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const { isLocked, remainingSeconds, recordFailedAttempt, resetRateLimit } = useLoginRateLimiter()
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const notice = window.sessionStorage.getItem('ha_cms_inactivity_logout')
      if (notice) {
        window.sessionStorage.removeItem('ha_cms_inactivity_logout')
        return 'Your session ended automatically after 15 minutes of inactivity.'
      }
    } catch {
      // Ignore storage errors
    }
    return null
  })

  useEffect(() => {
    if (isBootstrapped === false && mode === 'login') {
      setMode('bootstrap')
    }
  }, [isBootstrapped])

  const isStandaloneAdmin =
    typeof window !== 'undefined' && window.location.port === '5174'
  const publicSiteHref = isStandaloneAdmin ? 'http://localhost:8443/#/' : '#/'

  const switchMode = (m: Mode) => {
    clearError()
    setSuccessMsg(null)
    setMode(m)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login' && isLocked) {
      return
    }
    clearError()
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        resetRateLimit()
      } else if (mode === 'bootstrap') {
        await bootstrapSuperAdmin(name, email, password)
      } else if (mode === 'invite') {
        await signupWithInvite(name, email, password)
      } else if (mode === 'reset') {
        await resetPassword(email)
        setSuccessMsg('Password reset instructions sent. Please check your inbox.')
      }
    } catch {
      if (mode === 'login') {
        recordFailedAttempt()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCompleteCurrentSession = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      if (isBootstrapped === false) {
        await completeBootstrapForCurrentUser(name)
      } else if (hasPendingInvite) {
        await claimInviteForCurrentUser(name)
      }
    } catch {
      // Handled via AuthContext error state
    } finally {
      setSubmitting(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setSubmitting(true)
    try {
      await resolveMfaWithCode(mfaCode)
      resetRateLimit()
    } catch {
      // Handled via AuthContext error state
    } finally {
      setSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Two-Factor Authentication Verification View
  // ---------------------------------------------------------------------------
  if (mfaChallengeRequired || (profile?.mfaEnabled && !isMfaVerified)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6 font-sans">
        <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 shadow-card">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-900">
            <ShieldCheckIcon size={24} />
          </div>

          <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-ink">
            Two-Factor Verification
          </h2>
          <p className="mt-1.5 text-center text-xs text-ink-2">
            Enter the 6-digit code from your authenticator app to proceed.
          </p>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircleIcon size={15} className="mt-0.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                autoFocus
                required
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full text-center font-mono text-2xl font-bold tracking-[0.35em] rounded-xl border border-line-strong bg-canvas px-4 py-3 text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || mfaCode.length !== 6}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-900 font-semibold text-sm text-white shadow-soft transition hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <RefreshIcon size={16} className="animate-spin" />
              ) : (
                <ShieldCheckIcon size={16} />
              )}
              <span>Verify code</span>
            </button>

            <button
              type="button"
              onClick={cancelMfaChallenge}
              className="w-full text-center text-xs font-semibold text-ink-3 hover:text-ink transition"
            >
              Cancel and return to sign in
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen bg-canvas font-sans lg:grid-cols-[1fr_1fr]">
      {/* Left Editorial Brand Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-950 p-12 text-white lg:flex">
        {/* Clean, smooth ambient lighting without dot grids */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_32rem_at_85%_15%,rgb(47_125_184/0.28),transparent_70%),radial-gradient(32rem_26rem_at_15%_95%,rgb(255_164_56/0.14),transparent_70%)]"
        />

        {/* Top Header */}
        <div className="relative flex items-center justify-between">
          <img
            src={heiferLogoDark}
            alt="Heifer Academy"
            className="h-8 w-auto"
          />

          <a
            href={publicSiteHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            <span>Public Site</span>
            <ExternalIcon size={12} />
          </a>
        </div>

        {/* Middle Editorial Showcase */}
        <div className="relative my-auto max-w-md py-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wider text-accent-500 uppercase">
            Editorial Studio
          </span>

          <h1 className="mt-4 text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-[1.2]">
            Publishing knowledge for resilient communities.
          </h1>

          <p className="mt-3.5 text-sm leading-relaxed text-white/70">
            Centralized content management for agricultural curriculum, farmer field guides, and bilingual multimedia courses.
          </p>

          <div className="mt-8 flex items-center gap-2.5 text-xs text-white/60">
            <span className="flex size-2 rounded-full bg-emerald-400" />
            <span>Two-factor authentication &amp; enterprise session security active</span>
          </div>
        </div>

        {/* Bottom Metadata */}
        <div className="relative flex items-center justify-between border-t border-white/10 pt-5 text-xs text-white/40">
          <span>Heifer International Nepal</span>
          <span>CMS Portal</span>
        </div>
      </div>

      {/* Right Authentication Form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-[400px]">
          {/* Mobile Top Brand */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <img
              src={heiferLogoLight}
              alt="Heifer Academy"
              className="h-8 w-auto"
            />
            <a
              href={publicSiteHref}
              className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-card px-3 py-1.5 text-xs font-semibold text-brand transition hover:border-brand"
            >
              <span>Website</span>
              <ExternalIcon size={12} />
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-card p-8 shadow-card sm:p-9">
            {/* Case 1: Authenticated but awaiting profile setup */}
            {user && !profile ? (
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-brand">
                  <ShieldCheckIcon size={14} />
                  Account Activation
                </span>

                <h2 className="mt-3 text-2xl font-bold tracking-tight text-ink">
                  Set up your profile
                </h2>
                <p className="mt-1 text-xs text-ink-2">
                  Signed in as <strong className="font-semibold text-ink">{user.email}</strong>.
                </p>

                {error && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircleIcon size={15} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {(isBootstrapped === false || hasPendingInvite) ? (
                  <form onSubmit={handleCompleteCurrentSession} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-ink-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Maya Shrestha"
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-900 font-semibold text-sm text-white shadow-soft transition hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50"
                    >
                      {submitting && <RefreshIcon size={16} className="animate-spin" />}
                      <span>Complete profile setup</span>
                    </button>
                  </form>
                ) : null}

                <div className="mt-6 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-ink-3 hover:text-red-700 transition"
                  >
                    <LogOutIcon size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              /* Case 2: Standard Sign In / Bootstrap / Invite / Reset */
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-ink">
                  {mode === 'login' && 'Sign in'}
                  {mode === 'bootstrap' && 'Initial setup'}
                  {mode === 'invite' && 'Claim invitation'}
                  {mode === 'reset' && 'Reset password'}
                </h2>
                <p className="mt-1 text-xs text-ink-2">
                  {mode === 'login' && 'Enter your credentials to access the CMS.'}
                  {mode === 'bootstrap' && 'Create the primary Super Admin account.'}
                  {mode === 'invite' && 'Enter your details to activate your invited account.'}
                  {mode === 'reset' && 'Enter your email to receive a password reset link.'}
                </p>

                {inactivityNotice && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertCircleIcon size={15} className="mt-0.5 shrink-0 text-amber-700" />
                    <span>{inactivityNotice}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <AlertCircleIcon size={15} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {(mode === 'bootstrap' || mode === 'invite') && (
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-ink-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sita Sharma"
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-ink-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-semibold text-ink-2">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="text-xs font-semibold text-primary-700 hover:text-primary-900 transition"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-line-strong bg-card py-2.5 pr-10 pl-3.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-3 hover:text-ink transition focus:outline-none"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'login' && isLocked && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-900">
                      <AlertCircleIcon size={15} className="mt-0.5 shrink-0 text-red-700" />
                      <span>
                        Too many attempts. Please wait {remainingSeconds}s before retrying.
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || (mode === 'login' && isLocked)}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-900 font-semibold text-sm text-white shadow-soft transition hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshIcon size={16} className="animate-spin" />
                    ) : (
                      <LockIcon size={15} />
                    )}
                    <span>
                      {mode === 'login' && (isLocked ? `Locked (${remainingSeconds}s)` : 'Sign in')}
                      {mode === 'bootstrap' && 'Initialize Super Admin'}
                      {mode === 'invite' && 'Activate account'}
                      {mode === 'reset' && 'Send reset link'}
                    </span>
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-xs">
                  {mode !== 'login' ? (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-primary-700 hover:text-primary-900 transition"
                    >
                      &larr; Back to sign in
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode('invite')}
                      className="font-semibold text-primary-700 hover:text-primary-900 transition"
                    >
                      Claim an invitation
                    </button>
                  )}

                  {isBootstrapped === false && mode !== 'bootstrap' && (
                    <button
                      type="button"
                      onClick={() => switchMode('bootstrap')}
                      className="font-bold text-ochre hover:underline transition"
                    >
                      First-time setup &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
