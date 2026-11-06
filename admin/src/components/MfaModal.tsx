import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { generateQrDataUrl } from '@shared/security/qr'
import {
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  CopyIcon,
  RefreshIcon,
  ShieldCheckIcon,
  XIcon,
} from './icons'

interface MfaModalProps {
  isOpen: boolean
  onClose: () => void
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
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
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

  // Generate QR code data URL whenever secretData changes
  useEffect(() => {
    if (secretData?.uri) {
      generateQrDataUrl(secretData.uri, { width: 220, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch(() => setQrDataUrl(''))
    } else {
      setQrDataUrl('')
    }
  }, [secretData?.uri])

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
      setSetupError(
        e.message || 'Failed to verify code. Please check your authenticator app time and code.'
      )
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
      const generated = generateNewMfaSecret()
      setSecretData(generated)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setDisableError(e.message || 'Failed to disable 2FA. Verify your password.')
    } finally {
      setDisableLoading(false)
    }
  }

  // Format secret into groups of 4: ABCD EFGH IJKL MNOP QRST UVWX YZ23 4567
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-modal sm:p-7"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                isMfaActive ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-900'
              }`}
            >
              <ShieldCheckIcon size={22} />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-wider text-accent-500 uppercase">
                Staff Security
              </p>
              <h2 id="mfa-dialog-title" className="text-base font-bold text-ink sm:text-lg">
                Two-Factor Authentication
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
            /* ================= STATE 1: ACTIVE ================= */
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon size={20} className="mt-0.5 shrink-0 text-emerald-700" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">2FA Protection is Active</h3>
                    <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                      Your account (<strong className="font-semibold">{profile?.email || user?.email}</strong>) requires an authenticator verification code at each sign in.
                    </p>
                    {profile?.mfaEnrolledAt && (
                      <p className="mt-2 text-[11px] text-emerald-800/80">
                        Enrolled {new Date(profile.mfaEnrolledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Test Authenticator Sync */}
              <div className="rounded-xl border border-line bg-canvas p-4">
                <h4 className="text-xs font-bold text-ink uppercase tracking-wider">
                  Test Authenticator Sync
                </h4>
                <p className="mt-1 text-xs text-ink-2">
                  Verify current 6-digit code without changing your security settings:
                </p>
                <form onSubmit={handleTestCode} className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    pattern="[0-9]*"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="h-9 w-32 rounded-xl border border-line-strong bg-card text-center font-mono text-sm font-bold tracking-widest text-ink focus:border-primary-700 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={testing || testCode.length !== 6}
                    className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-primary-900 px-4 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
                  >
                    {testing ? <RefreshIcon size={13} className="animate-spin" /> : null}
                    <span>Test Code</span>
                  </button>

                  {testResult === 'success' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <CheckCircleIcon size={14} /> Synchronized!
                    </span>
                  )}
                  {testResult === 'fail' && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700">
                      <AlertCircleIcon size={14} /> Code invalid
                    </span>
                  )}
                </form>
              </div>

              {/* Disable Section */}
              <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                      Disable 2FA
                    </h4>
                    <p className="text-xs text-red-800">Reverts to password-only authentication.</p>
                  </div>
                  {!showDisableConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowDisableConfirm(true)}
                      className="rounded-xl border border-red-300 bg-card px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-50"
                    >
                      Turn Off
                    </button>
                  )}
                </div>

                {showDisableConfirm && (
                  <form onSubmit={handleDisableMfa} className="mt-3 space-y-2 border-t border-red-200 pt-3">
                    <p className="text-xs font-semibold text-red-900">
                      Confirm your current account password:
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="password"
                        required
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Current password"
                        className="h-9 flex-1 min-w-[180px] rounded-xl border border-red-300 bg-card px-3 text-xs text-ink focus:border-red-600 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={disableLoading || !disablePassword}
                        className="h-9 rounded-xl bg-red-600 px-4 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                      >
                        {disableLoading ? 'Verifying...' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDisableConfirm(false)
                          setDisablePassword('')
                          setDisableError(null)
                        }}
                        className="h-9 rounded-xl border border-line-strong bg-card px-3 text-xs font-semibold text-ink-2 hover:bg-subtle"
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
            /* ================= STATE 2: ENROLLMENT SETUP ================= */
            <div className="space-y-4">
              {setupSuccess && (
                <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                  <CheckCircleIcon size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>{setupSuccess}</span>
                </div>
              )}

              {setupError && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-800">
                  <AlertCircleIcon size={16} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{setupError}</span>
                </div>
              )}

              {/* Step 1 & 2 in Clean Side-by-Side Card */}
              <div className="rounded-xl border border-line bg-canvas p-4 space-y-4">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  {/* Verified QR Code Image */}
                  <div className="flex size-40 shrink-0 items-center justify-center rounded-2xl border border-line bg-white p-2 shadow-xs">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Scan QR code with Google Authenticator"
                        className="size-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-ink-3">
                        <RefreshIcon size={14} className="animate-spin" />
                        <span>Loading QR...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left">
                    <div>
                      <h4 className="text-xs font-bold text-ink">1. Scan with Authenticator</h4>
                      <p className="mt-0.5 text-xs text-ink-2 leading-relaxed">
                        Open Google Authenticator, Microsoft Authenticator, or Authy and scan this code.
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-ink-3">Or enter key manually:</p>
                      <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-line-strong bg-card px-3 py-1.5 font-mono text-[11px] font-bold tracking-wider text-ink">
                        <span className="truncate select-all">{formattedSecret}</span>
                        <button
                          type="button"
                          onClick={handleCopySecret}
                          className="shrink-0 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-brand hover:bg-subtle"
                          title="Copy setup key"
                        >
                          {copied ? (
                            <CheckIcon size={12} className="text-emerald-700" />
                          ) : (
                            <CopyIcon size={12} />
                          )}
                          <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Verify and activate */}
              <div className="rounded-xl border border-line bg-canvas p-4">
                <h4 className="text-xs font-bold text-ink">2. Enter 6-digit confirmation code</h4>
                <p className="mt-0.5 text-xs text-ink-2">
                  Enter the temporary code currently showing in your authenticator app:
                </p>

                <form onSubmit={handleEnableMfa} className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="h-10 w-36 rounded-xl border border-line-strong bg-card text-center font-mono text-base font-bold tracking-[0.25em] text-ink focus:border-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-100"
                  />
                  <button
                    type="submit"
                    disabled={setupLoading || setupCode.length !== 6}
                    className="flex h-10 items-center gap-1.5 rounded-xl bg-primary-900 px-5 text-xs font-bold text-white shadow-soft transition hover:bg-primary-700 disabled:opacity-50"
                  >
                    {setupLoading ? (
                      <RefreshIcon size={14} className="animate-spin" />
                    ) : (
                      <ShieldCheckIcon size={14} />
                    )}
                    <span>Activate 2FA</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-line-strong bg-card px-4 py-1.5 text-xs font-semibold text-ink hover:bg-subtle"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
