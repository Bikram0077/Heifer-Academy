import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import heiferLogoLight from '@siteAssets/heifer-academy-logo-light.png'
import heiferLogoDark from '@siteAssets/heifer-academy-logo-dark.png'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalIcon,
  LanguagesIcon,
  LockIcon,
  LogOutIcon,
  RefreshIcon,
  ShieldCheckIcon,
  SproutIcon,
} from '../components/icons'

type Mode = 'login' | 'bootstrap' | 'invite' | 'reset'

export function LoginPage() {
  const {
    user,
    profile,
    isBootstrapped,
    hasPendingInvite,
    pendingInviteRole,
    login,
    logout,
    bootstrapSuperAdmin,
    completeBootstrapForCurrentUser,
    signupWithInvite,
    claimInviteForCurrentUser,
    resetPassword,
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
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [inactivityNotice, setInactivityNotice] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const notice = window.sessionStorage.getItem('ha_cms_inactivity_logout')
      if (notice) {
        window.sessionStorage.removeItem('ha_cms_inactivity_logout')
        return 'Your session ended automatically after 15 minutes of inactivity for security.'
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
    clearError()
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else if (mode === 'bootstrap') {
        await bootstrapSuperAdmin(name, email, password)
      } else if (mode === 'invite') {
        await signupWithInvite(name, email, password)
      } else if (mode === 'reset') {
        await resetPassword(email)
        setSuccessMsg(
          'Password setup / reset email sent! Check your Gmail, Outlook, or organization inbox (and Spam/Promotions folder).'
        )
      }
    } catch {
      // Handled via AuthContext error state
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

  return (
    <div className="grid min-h-screen bg-canvas font-sans lg:grid-cols-[1.05fr_1fr]">
      {/* Left Brand Editorial Panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(42rem_30rem_at_85%_15%,rgb(47_125_184/0.35),transparent_70%),radial-gradient(28rem_24rem_at_10%_95%,rgb(255_164_56/0.16),transparent_70%)]"
        />

        <div className="relative flex items-center justify-between">
          <div className="flex flex-col items-start gap-1.5">
            <img
              src={heiferLogoDark}
              alt="Heifer Academy"
              className="h-9 w-auto"
            />
            <p className="text-[0.68rem] font-bold tracking-[0.14em] text-accent-500 uppercase">
              Editorial &amp; Content Studio
            </p>
          </div>

          <a
            href={publicSiteHref}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/90 transition hover:bg-white/12 hover:text-white"
          >
            Public Website <ExternalIcon size={13} />
          </a>
        </div>

        <div className="relative my-auto max-w-lg py-12">
          <p className="text-xs font-bold tracking-[0.14em] text-accent-500 uppercase">
            Heifer International Nepal
          </p>
          <h1 className="mt-3 text-4xl leading-[1.15] font-extrabold tracking-[-0.02em] text-white">
            Manage every course, story, navigation menu, and field guide in real time.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/78">
            Draft curriculum updates, publish bilingual handouts, customize header and footer
            menus, and invite team members using any Gmail or organization email.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent-500/20 text-accent-500">
                <LanguagesIcon size={18} />
              </span>
              <p className="mt-3 text-sm font-bold text-white">Side-by-Side Bilingual</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Edit English and नेपाली copy together for courses, materials, header/footer, and UI
                labels.
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/[0.05] p-4">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-teal-500/20 text-teal-500">
                <SproutIcon size={18} />
              </span>
              <p className="mt-3 text-sm font-bold text-white">Safe Draft &amp; Live Workflow</p>
              <p className="mt-1 text-xs leading-relaxed text-white/70">
                Save working drafts privately and publish live to Firestore in a single click.
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/60">
          <span>Project: heifer-academy-cms</span>
          <span>Works with any invited email</span>
        </div>
      </div>

      {/* Right Authentication Workspace */}
      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Header */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <div className="flex flex-col items-start gap-1">
              <img
                src={heiferLogoLight}
                alt="Heifer Academy"
                className="h-8 w-auto"
              />
              <p className="text-[0.65rem] font-bold tracking-widest text-ochre uppercase">
                Editorial Portal
              </p>
            </div>
            <a
              href={publicSiteHref}
              className="inline-flex items-center gap-1 rounded-full border border-line-strong bg-card px-3 py-1.5 text-xs font-semibold text-brand"
            >
              Website <ExternalIcon size={12} />
            </a>
          </div>

          <div className="rounded-2xl border border-line bg-card p-7 shadow-card sm:p-8">
            {/* Case 1: User is signed into Firebase Auth, but users/{uid} profile doc does not exist yet */}
            {user && !profile ? (
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-bold text-brand">
                  <ShieldCheckIcon size={15} />
                  {isBootstrapped === false
                    ? 'Complete Initial Super Admin Setup'
                    : hasPendingInvite
                      ? `Claim ${pendingInviteRole?.replace('_', ' ')} Invitation`
                      : 'Staff Profile Required'}
                </div>

                <h2 className="text-2xl font-bold tracking-[-0.02em] text-ink">
                  {isBootstrapped === false
                    ? 'Finish Initializing CMS'
                    : hasPendingInvite
                      ? 'Activate Your Staff Account'
                      : 'No Staff Access Found'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">
                  Signed in as <strong className="font-semibold text-ink">{user.email}</strong>.{' '}
                  {isBootstrapped === false
                    ? 'Confirm your display name below to create the initial Super Admin profile and unlock full website editing.'
                    : hasPendingInvite
                      ? 'Confirm your display name below to activate your staff invitation.'
                      : 'This email does not have an active staff profile or pending invitation yet. Sign out or ask a Super Admin to invite your email.'}
                </p>

                {inactivityNotice && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-medium text-amber-900">
                    <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-amber-700" />
                    <span>{inactivityNotice}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
                    <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {(isBootstrapped === false || hasPendingInvite) ? (
                  <form onSubmit={handleCompleteCurrentSession} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Your Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Heifer Nepal Editorial Lead"
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-900 px-5 text-sm font-bold text-white shadow-soft transition hover:bg-primary-700 disabled:opacity-50"
                    >
                      {submitting && <RefreshIcon size={16} className="animate-spin" />}
                      {isBootstrapped === false
                        ? 'Activate Super Admin & Enter CMS'
                        : 'Activate Invitation & Enter CMS'}
                    </button>
                  </form>
                ) : null}

                <div className="mt-5 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-ink-2 hover:text-red-700"
                  >
                    <LogOutIcon size={14} />
                    Sign out of {user.email}
                  </button>
                </div>
              </div>
            ) : (
              /* Case 2: Standard Sign In / Bootstrap / Invite / Reset */
              <div>
                {isBootstrapped === false && (
                  <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-accent-100 p-3.5 text-xs text-ochre">
                    <ShieldCheckIcon size={17} className="mt-0.5 shrink-0 text-accent-500" />
                    <div>
                      <p className="font-bold">First-Time CMS Setup</p>
                      <p className="mt-0.5 leading-relaxed">
                        Create your initial Super Admin account below (any email address works,
                        including Gmail or organization email).
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-xs font-bold tracking-[0.14em] text-ochre uppercase">
                  {mode === 'login' && 'Staff Authentication'}
                  {mode === 'bootstrap' && 'Initial Super Admin'}
                  {mode === 'invite' && 'Staff Invitation'}
                  {mode === 'reset' && 'Set or Reset Password'}
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink">
                  {mode === 'login' && 'Sign in to Heifer Academy'}
                  {mode === 'bootstrap' && 'Create Super Admin Account'}
                  {mode === 'invite' && 'Claim Your Staff Invite'}
                  {mode === 'reset' && 'Set / Reset Your Password'}
                </h2>
                <p className="mt-1.5 text-sm text-ink-2">
                  {mode === 'login' &&
                    'Sign in with any invited email (Gmail, Outlook, Yahoo, or organization email) after setting your password from the email link.'}
                  {mode === 'bootstrap' &&
                    'This first administrator account receives full permissions across the CMS.'}
                  {mode === 'invite' &&
                    'Enter the email address invited by your Super Admin to set a password and join.'}
                  {mode === 'reset' &&
                    'Enter your invited email to receive a password setup / reset link in your inbox.'}
                </p>

                {inactivityNotice && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-xs font-medium text-amber-900">
                    <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-amber-700" />
                    <span>{inactivityNotice}</span>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
                    <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
                    <CheckCircleIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {(mode === 'bootstrap' || mode === 'invite') && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sita Sharma"
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@gmail.com or name@organization.org"
                      className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                    />
                  </div>

                  {mode !== 'reset' && (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-xs font-bold tracking-wide text-ink uppercase">
                          Password
                        </label>
                        {mode === 'login' && (
                          <button
                            type="button"
                            onClick={() => switchMode('reset')}
                            className="text-xs font-semibold text-brand hover:underline"
                          >
                            Set / Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-900 px-5 text-sm font-bold text-white shadow-soft transition hover:bg-primary-700 disabled:opacity-50"
                  >
                    {submitting ? (
                      <RefreshIcon size={16} className="animate-spin" />
                    ) : (
                      <LockIcon size={15} />
                    )}
                    <span>
                      {mode === 'login' && 'Sign In to CMS'}
                      {mode === 'bootstrap' && 'Initialize Super Admin'}
                      {mode === 'invite' && 'Complete Staff Registration'}
                      {mode === 'reset' && 'Email Password Setup Link'}
                    </span>
                  </button>
                </form>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-xs">
                  {mode !== 'login' ? (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="font-semibold text-brand hover:underline"
                    >
                      &larr; Back to Staff Sign In
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => switchMode('invite')}
                      className="font-semibold text-brand hover:underline"
                    >
                      Have a manual invite code? Claim here
                    </button>
                  )}

                  {isBootstrapped === false && mode !== 'bootstrap' && (
                    <button
                      type="button"
                      onClick={() => switchMode('bootstrap')}
                      className="font-bold text-ochre hover:underline"
                    >
                      First-time Super Admin setup &rarr;
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
