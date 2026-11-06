import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { generateQrMatrix } from '@shared/security/qr'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  LockIcon,
  RefreshIcon,
  ShieldCheckIcon,
  XIcon,
} from './icons'

interface MfaModalProps {
  isOpen: boolean
  onClose: () => void
}

function QrCodeSvg({ text, size = 168 }: { text: string; size?: number }) {
  if (!text) return null
  try {
    const matrix = generateQrMatrix(text)
    const moduleCount = matrix.length
    const margin = 3
    const totalSize = moduleCount + margin * 2

    let pathData = ''
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          pathData += `M${c + margin},${r + margin}h1v1h-1z `
        }
      }
    }

    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${totalSize} ${totalSize}`}
        width={size}
        height={size}
        shapeRendering="crispEdges"
        className="rounded-lg"
      >
        <rect width={totalSize} height={totalSize} fill="#ffffff" />
        <path d={pathData.trim()} fill="#0f172a" />
      </svg>
    )
  } catch {
    return <div className="text-xs text-red-500">QR preview unavailable</div>
  }
}

export function MfaModal({ isOpen, onClose }: MfaModalProps) {
  const {
    profile,
    user,
    generateNewMfaSecret,
    enableMfaForCurrentUser,
    disableMfaForCurrentUser,
    testMfaCodeForCurrentUser,
  } = useAuth()

  // Setup state
  const [secretData, setSecretData] = useState<{ secret: string; uri: string } | null>(null)
  const [setupCode, setSetupCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupError, setSetupError] = useState<string | null>(null)
  const [setupSuccess, setSetupSuccess] = useState<string | null>(null)

  // Test code state (when enabled)
  const [testCode, setTestCode] = useState('')
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle')
  const [testing, setTesting] = useState(false)

  // Disable state (when enabled)
  const [disablePassword, setDisablePassword] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !profile?.mfaEnabled) {
      const generated = generateNewMfaSecret()
      setSecretData(generated)
      setSetupCode('')
      setSetupError(null)
      setSetupSuccess(null)
    }
    if (isOpen) {
      setTestCode('')
      setTestResult('idle')
      setShowDisableConfirm(false)
      setDisablePassword('')
      setDisableError(null)
    }
  }, [isOpen, profile?.mfaEnabled])

  if (!isOpen) return null

  const isMfaActive = Boolean(profile?.mfaEnabled)

  const handleCopySecret = async () => {
    if (!secretData?.secret) return
    try {
      await navigator.clipboard.writeText(secretData.secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!secretData?.secret) return
    setSetupError(null)
    setSetupSuccess(null)
    setSetupLoading(true)

    try {
      await enableMfaForCurrentUser(secretData.secret, setupCode)
      setSetupSuccess('Two-Factor Authentication is now active! Your account is secured.')
      setTimeout(() => {
        setSetupSuccess(null)
      }, 3000)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setSetupError(e.message || 'Failed to verify code. Please check your authenticator app and try again.')
    } finally {
      setSetupLoading(false)
    }
  }

  const handleTestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!testCode.trim()) return
    setTesting(true)
    setTestResult('idle')
    try {
      const valid = await testMfaCodeForCurrentUser(testCode)
      setTestResult(valid ? 'success' : 'fail')
    } catch {
      setTestResult('fail')
    } finally {
      setTesting(false)
    }
  }

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    setDisableError(null)
    setDisableLoading(true)
    try {
      await disableMfaForCurrentUser(disablePassword)
      setShowDisableConfirm(false)
      setDisablePassword('')
      // Re-generate fresh secret for if they ever re-enable
      const generated = generateNewMfaSecret()
      setSecretData(generated)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setDisableError(e.message || 'Failed to disable 2FA. Verify your password.')
    } finally {
      setDisableLoading(false)
    }
  }

  // Format secret with spaces: ABCD EFGH IJKL MNOP QRST
  const formattedSecret = secretData?.secret.match(/.{1,4}/g)?.join(' ') || secretData?.secret || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mfa-dialog-title"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-modal sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 items-center justify-center rounded-xl ${
                isMfaActive ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-900'
              }`}
            >
              <ShieldCheckIcon size={24} />
            </div>
            <div>
              <p className="text-[0.68rem] font-bold tracking-[0.14em] text-accent-500 uppercase">
                Staff Account Security
              </p>
              <h2 id="mfa-dialog-title" className="text-lg font-bold text-ink">
                Two-Factor Authentication (2FA)
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-3 hover:bg-subtle hover:text-ink"
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-5">
          {isMfaActive ? (
            /* ================= STATE 1: MFA IS ACTIVE ================= */
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon size={20} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Two-Factor Authentication is Active &amp; Protecting Your Account
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-900">
                      Signed in as <strong className="font-semibold">{profile?.email || user?.email}</strong> with role{' '}
                      <span className="font-semibold uppercase tracking-wider">
                        {profile?.role?.replace('_', ' ')}
                      </span>
                      . Every time you log in to the CMS, you will be required to provide a 6-digit TOTP verification code from your mobile authenticator app.
                    </p>
                    {profile?.mfaEnrolledAt && (
                      <p className="mt-2 text-[0.7rem] text-emerald-800/80">
                        Enrolled on {new Date(profile.mfaEnrolledAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Authenticator Code section */}
              <div className="rounded-xl border border-line bg-canvas p-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Test Authenticator Sync
                </h4>
                <p className="mt-1 text-xs text-ink-2">
                  Verify that your mobile app is generating valid codes without altering your account settings.
                </p>
                <form onSubmit={handleTestCode} className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 123456"
                    className="h-9 w-36 text-center font-mono text-sm tracking-widest rounded-xl border border-line-strong bg-card px-3 text-ink focus:border-primary-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={testing || testCode.length !== 6}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
                  >
                    {testing ? <RefreshIcon size={14} className="animate-spin" /> : null}
                    <span>Test Code</span>
                  </button>

                  {testResult === 'success' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircleIcon size={14} /> Synchronized &amp; Valid!
                    </span>
                  )}
                  {testResult === 'fail' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                      <AlertCircleIcon size={14} /> Code invalid or clock skewed.
                    </span>
                  )}
                </form>
              </div>

              {/* Disable 2FA Section */}
              <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                      Disable Two-Factor Authentication
                    </h4>
                    <p className="mt-0.5 text-xs text-red-800">
                      Reverts your login security to password-only. Not recommended.
                    </p>
                  </div>
                  {!showDisableConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowDisableConfirm(true)}
                      className="rounded-full border border-red-300 bg-card px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50 hover:text-red-900"
                    >
                      Turn Off 2FA
                    </button>
                  )}
                </div>

                {showDisableConfirm && (
                  <form onSubmit={handleDisableMfa} className="mt-4 space-y-3 border-t border-red-200 pt-3">
                    <p className="text-xs font-semibold text-red-900">
                      Enter your current password to confirm disabling Two-Factor Authentication:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="password"
                        required
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Current password"
                        className="h-9 flex-1 min-w-[200px] rounded-xl border border-red-300 bg-card px-3 text-xs text-ink focus:border-red-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={disableLoading || !disablePassword}
                        className="h-9 rounded-full bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {disableLoading ? 'Verifying...' : 'Confirm Disable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisableConfirm(false)
                          setDisablePassword('')
                          setDisableError(null)
                        }}
                        className="h-9 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink-2 hover:bg-subtle"
                      >
                        Cancel
                      </button>
                    </div>
                    {disableError && (
                      <p className="text-xs font-semibold text-red-700">{disableError}</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* ================= STATE 2: MFA SETUP ENROLLMENT ================= */
            <div className="space-y-5">
              <div className="rounded-xl border border-accent-300 bg-accent-50/70 p-3.5 text-xs text-ochre">
                <p className="font-bold">Protect Your CMS Access</p>
                <p className="mt-0.5 leading-relaxed">
                  Two-Factor Authentication adds an extra layer of defense for Super Admins and Editors. Anyone attempting to access your account must supply both your password and a temporary verification code.
                </p>
              </div>

              {setupSuccess && (
                <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
                  <CheckCircleIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{setupSuccess}</span>
                </div>
              )}

              {setupError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-800">
                  <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{setupError}</span>
                </div>
              )}

              {/* Step 1: Install app */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-ink">Install an Authenticator App</h4>
                  <p className="mt-0.5 text-xs text-ink-2">
                    Use <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong>, <strong>Apple Passwords</strong>, or <strong>Authy</strong> on your smartphone.
                  </p>
                </div>
              </div>

              {/* Step 2: Scan QR or copy key */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
                  2
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-ink">Scan QR Code or Enter Setup Key</h4>
                  <p className="mt-0.5 text-xs text-ink-2">
                    In your authenticator app, tap <strong>+</strong> and scan this QR code:
                  </p>

                  <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    {/* SVG QR Code */}
                    <div className="rounded-xl border border-line-strong bg-white p-2 shadow-xs">
                      <QrCodeSvg text={secretData?.uri || ''} size={168} />
                    </div>

                    {/* Manual Key */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <p className="text-[0.7rem] font-bold uppercase tracking-wider text-ink-3">
                        Manual Entry Secret Key:
                      </p>
                      <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-canvas px-3 py-2 font-mono text-xs font-bold tracking-wider text-ink">
                        <span className="truncate">{formattedSecret}</span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="shrink-0 rounded-lg p-1 text-ink-2 hover:bg-card hover:text-brand"
                          title="Copy secret key"
                        >
                          {copied ? (
                            <CheckIcon size={14} className="text-emerald-700" />
                          ) : (
                            <CopyIcon size={14} />
                          )}
                        </button>
                      </div>
                      <p className="text-[0.68rem] text-ink-3">
                        Account: {user?.email || profile?.email} | Type: Time-based (TOTP)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Enter code and verify */}
              <div className="flex items-start gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-900 text-xs font-bold text-white">
                  3
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-ink">Confirm 6-Digit Code</h4>
                  <p className="mt-0.5 text-xs text-ink-2">
                    Enter the code currently generated by your authenticator app to finalize enrollment:
                  </p>

                  <form onSubmit={handleEnableMfa} className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        required
                        value={setupCode}
                        onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="h-10 w-44 rounded-xl border border-line-strong bg-card text-center font-mono text-lg font-bold tracking-[0.25em] text-ink focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                      />
                      <button
                        type="submit"
                        disabled={setupLoading || setupCode.length !== 6}
                        className="flex h-10 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft transition hover:bg-primary-700 disabled:opacity-50"
                      >
                        {setupLoading ? (
                          <RefreshIcon size={14} className="animate-spin" />
                        ) : (
                          <ShieldCheckIcon size={14} />
                        )}
                        <span>Verify &amp; Activate 2FA</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line-strong bg-card px-5 py-2 text-xs font-bold text-ink hover:bg-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
