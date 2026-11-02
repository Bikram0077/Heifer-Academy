import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth, type InviteResult } from '../context/AuthContext'
import type { Invite, Role, UserProfile } from '@shared/schema'
import {
  ConfirmModal,
  SectionCard,
  ToastBanner,
  useToast,
} from '../components/CmsUi'
import {
  CheckCircleIcon,
  CopyIcon,
  ExternalIcon,
  LockIcon,
  MailIcon,
  PlusIcon,
  RefreshIcon,
  SaveIcon,
  ShieldCheckIcon,
  TrashIcon,
  XIcon,
} from '../components/icons'

export function UsersPage() {
  const {
    user,
    profile,
    isSuperAdmin,
    updateDisplayName,
    inviteStaffByEmail,
    sendStaffPasswordEmail,
  } = useAuth()
  const { toast, showToast, clearToast } = useToast()

  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  const [myName, setMyName] = useState(profile?.name || '')
  const [savingName, setSavingName] = useState(false)

  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('editor')
  const [sendEmailToggle, setSendEmailToggle] = useState(true)
  const [inviting, setInviting] = useState(false)

  const [inviteDelivery, setInviteDelivery] = useState<InviteResult | null>(null)
  const [sendingResetFor, setSendingResetFor] = useState<string | null>(null)

  const [removeTarget, setRemoveTarget] = useState<{
    uid: string
    name: string
  } | null>(null)

  useEffect(() => {
    setMyName(profile?.name || '')
  }, [profile?.name])

  useEffect(() => {
    if (!isSuperAdmin) {
      setLoading(false)
      return
    }

    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      const list: (UserProfile & { uid: string })[] = []
      snap.forEach((d) => {
        list.push({ uid: d.id, ...(d.data() as UserProfile) })
      })
      setUsers(
        list.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
      )
      setLoading(false)
    })

    const unsubInvites = onSnapshot(collection(db, 'invites'), (snap) => {
      const list: Invite[] = []
      snap.forEach((d) => {
        list.push(d.data() as Invite)
      })
      setInvites(list)
    })

    return () => {
      unsubUsers()
      unsubInvites()
    }
  }, [isSuperAdmin])

  const handleSaveMyName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingName(true)
    try {
      await updateDisplayName(myName)
      showToast('Updated your display name.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to update display name.', 'error')
    } finally {
      setSavingName(false)
    }
  }

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = inviteEmail.trim().toLowerCase()
    if (!normalized) return

    setInviting(true)
    try {
      const result = await inviteStaffByEmail(inviteName, normalized, inviteRole, sendEmailToggle)
      setInviteName('')
      setInviteEmail('')
      setInviteRole('editor')
      setShowInviteModal(false)
      setInviteDelivery(result)
      if (result.emailSent) {
        showToast(`Invitation & password-setup email sent to ${result.email}!`)
      } else {
        showToast(`Staff account prepared for ${result.email}.`, 'info')
      }
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to invite staff member.', 'error')
    } finally {
      setInviting(false)
    }
  }

  const handleSendPasswordSetupEmail = async (emailAddr: string) => {
    setSendingResetFor(emailAddr)
    try {
      await sendStaffPasswordEmail(emailAddr)
      showToast(
        `Password setup / reset email sent to ${emailAddr}! Ask them to check their inbox (and Spam folder).`
      )
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to send setup email.', 'error')
    } finally {
      setSendingResetFor(null)
    }
  }

  const handleRoleChange = async (uid: string, nextRole: Role) => {
    if (uid === user?.uid) return
    try {
      const target = users.find((u) => u.uid === uid)
      await updateDoc(doc(db, 'users', uid), {
        role: nextRole,
        disabled: Boolean(target?.disabled),
      })
      showToast('Updated staff member role.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to update role.', 'error')
    }
  }

  const handleToggleDisabled = async (uid: string, currentDisabled: boolean) => {
    if (uid === user?.uid) return
    try {
      const target = users.find((u) => u.uid === uid)
      await updateDoc(doc(db, 'users', uid), {
        role: target?.role || 'viewer',
        disabled: !currentDisabled,
      })
      showToast(!currentDisabled ? 'Account suspended.' : 'Account re-enabled.')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to update account status.', 'error')
    }
  }

  const confirmDeleteUser = async () => {
    if (!removeTarget) return
    try {
      await deleteDoc(doc(db, 'users', removeTarget.uid))
      showToast(`Removed ${removeTarget.name} from staff directory.`, 'info')
    } catch (err: unknown) {
      const e = err as { message?: string }
      showToast(e.message || 'Failed to remove user.', 'error')
    } finally {
      setRemoveTarget(null)
    }
  }

  const copyText = async (txt: string, label: string) => {
    try {
      await navigator.clipboard.writeText(txt)
      showToast(`${label} copied to clipboard.`)
    } catch {
      showToast(`Could not copy ${label.toLowerCase()}.`, 'error')
    }
  }

  const buildWelcomeMailLinks = (res: InviteResult) => {
    const roleLabel = res.role.replace('_', ' ').toUpperCase()
    const subject = `Invitation to Heifer Academy CMS (${roleLabel})`
    const lines = [
      `Hello ${res.name},`,
      '',
      `You have been invited to collaborate on the Heifer Academy CMS as ${roleLabel}.`,
      '',
      res.emailSent
        ? `1. Check your inbox (${res.email}) for an automated password-setup email from Firebase (noreply@heifer-academy-cms.firebaseapp.com) and click the link to choose your password.`
        : `1. Open the CMS login link below to sign in.`,
      `2. Sign in to the CMS Studio here: ${res.cmsLoginUrl}`,
      ...(res.temporaryPassword
        ? [
            '',
            `Alternatively, you can sign in immediately with this temporary password: ${res.temporaryPassword}`,
          ]
        : []),
      '',
      `Warm regards,`,
      `${profile?.name || 'Heifer Academy Admin'}`,
    ]
    const body = lines.join('\n')
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      res.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    const mailtoUrl = `mailto:${encodeURIComponent(res.email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`
    return { gmailUrl, mailtoUrl }
  }

  if (!isSuperAdmin) {
    return (
      <div className="rounded-2xl border border-line bg-card p-12 text-center shadow-soft">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-accent-100 text-ochre">
          <LockIcon size={22} />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Super Admin Access Only</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-2">
          Only Super Administrators can invite staff members or modify user roles.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-14">
      <ToastBanner toast={toast} onDismiss={clearToast} />

      <ConfirmModal
        open={Boolean(removeTarget)}
        title="Remove Staff Account?"
        message={`Remove "${removeTarget?.name}" from CMS staff access? They will immediately lose permission to read drafts or edit content.`}
        confirmLabel="Remove Access"
        tone="danger"
        onConfirm={confirmDeleteUser}
        onCancel={() => setRemoveTarget(null)}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between md:p-7">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-ochre uppercase">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-[-0.02em] text-ink">
            Team Accounts &amp; Universal Email Invitations
          </h1>
          <p className="mt-1 text-sm text-ink-2">
            Invite colleagues on any email provider (Gmail, Outlook, Yahoo, or organization domain)
            and deliver real password-setup emails straight to their inbox.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowInviteModal(true)}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white shadow-soft hover:bg-primary-700"
        >
          <PlusIcon size={16} />
          Invite Staff Member
        </button>
      </div>

      {/* Role Permissions Legend + Own Profile Card */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        <SectionCard
          eyebrow="Your Account"
          title="My Administrator Profile"
          description="Displayed on saved drafts and published content logs."
        >
          <form onSubmit={handleSaveMyName} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                Display Name
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={myName}
                onChange={(e) => setMyName(e.target.value)}
                className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-ink-2">
              <span>Signed in as {profile?.email}</span>
              <button
                type="submit"
                disabled={savingName || myName.trim() === profile?.name}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary-900 px-4 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-40"
              >
                <SaveIcon size={13} />
                Update Name
              </button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          eyebrow="Access Levels"
          title="Role Capabilities"
          description="Enforced directly by Firestore security rules across any email domain."
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3">
              <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-brand" />
              <div>
                <p className="font-bold text-ink">Super Admin</p>
                <p className="text-ink-2">
                  Full control over all courses, materials, header &amp; footer, pages, UI labels,
                  global branding, and staff invitations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3">
              <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-emerald-700" />
              <div>
                <p className="font-bold text-ink">Editor</p>
                <p className="text-ink-2">
                  Create, save drafts, and publish Courses, Materials &amp; Guides, Header &amp;
                  Footer menus, Homepage, Custom Pages, and Bilingual UI Labels.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3">
              <ShieldCheckIcon size={16} className="mt-0.5 shrink-0 text-ink-3" />
              <div>
                <p className="font-bold text-ink">Viewer</p>
                <p className="text-ink-2">
                  Read-only access to inspect unpublished drafts and course structures inside the
                  CMS.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Active Staff Table */}
      <SectionCard
        eyebrow="Staff Directory"
        title={`Registered Staff Accounts (${users.length})`}
        description="Accounts created via email invitation appear here immediately so you can manage roles or resend a password setup email anytime."
      >
        {loading ? (
          <div className="flex items-center justify-center py-10 text-ink-3">
            <RefreshIcon size={20} className="animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {users.map((u) => {
              const isSelf = u.uid === user?.uid
              return (
                <div
                  key={u.uid}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-extrabold text-brand">
                      {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-ink">{u.name}</span>
                        {isSelf && (
                          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[0.65rem] font-bold text-brand uppercase">
                            You
                          </span>
                        )}
                        {u.disabled && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.65rem] font-bold text-red-700 uppercase">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-2">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      disabled={isSelf}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as Role)}
                      className="h-9 rounded-xl border border-line-strong bg-card px-3 text-xs font-semibold text-ink disabled:bg-subtle disabled:text-ink-2"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="super_admin">Super Admin</option>
                    </select>

                    <button
                      type="button"
                      disabled={sendingResetFor === u.email}
                      onClick={() => handleSendPasswordSetupEmail(u.email)}
                      title="Send password setup / reset link to their email inbox"
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3 text-xs font-semibold text-ink-2 hover:border-primary-700 hover:text-brand disabled:opacity-50"
                    >
                      {sendingResetFor === u.email ? (
                        <RefreshIcon size={13} className="animate-spin" />
                      ) : (
                        <MailIcon size={13} />
                      )}
                      <span>Send Password Email</span>
                    </button>

                    {!isSelf && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleDisabled(u.uid, u.disabled)}
                          className={`h-9 rounded-full border px-3.5 text-xs font-semibold ${
                            u.disabled
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              : 'border-amber-300 bg-accent-100 text-ochre hover:bg-accent-500/20'
                          }`}
                        >
                          {u.disabled ? 'Re-enable' : 'Suspend'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setRemoveTarget({ uid: u.uid, name: u.name || u.email })
                          }
                          title="Remove staff member"
                          className="inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        >
                          <TrashIcon size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      {/* Pending Invitations (for accounts that already existed in Firebase Auth prior to invite) */}
      {invites.length > 0 && (
        <SectionCard
          eyebrow="Awaiting First Sign-In"
          title={`Pending Invitations (${invites.length})`}
          description="These email addresses already had an Auth record and will automatically receive their CMS role the moment they sign in."
        >
          <div className="divide-y divide-line">
            {invites.map((inv) => (
              <div
                key={inv.email}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div>
                  <p className="text-sm font-bold text-ink">
                    {inv.name ? `${inv.name} (${inv.email})` : inv.email}
                  </p>
                  <p className="text-xs text-ink-2">
                    Assigned role:{' '}
                    <strong className="uppercase">{inv.role.replace('_', ' ')}</strong>
                    {inv.invitedAt
                      ? ` · Invited ${new Date(inv.invitedAt).toLocaleDateString()}`
                      : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={sendingResetFor === inv.email}
                    onClick={() => handleSendPasswordSetupEmail(inv.email)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong px-3 text-xs font-semibold text-ink-2 hover:border-primary-700 hover:text-brand disabled:opacity-50"
                  >
                    <MailIcon size={13} />
                    Resend Setup Email
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteDoc(doc(db, 'invites', inv.email))
                      showToast(`Revoked invitation for ${inv.email}.`, 'info')
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-full border border-line px-3 text-xs font-semibold text-ink-2 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    <TrashIcon size={13} />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-modal">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-lg font-bold text-ink">Invite Staff Member</h2>
                <p className="text-xs text-ink-2">
                  Works with Gmail, Outlook, Yahoo, or any organization email
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="rounded-lg p-1 text-ink-3 hover:bg-subtle hover:text-ink"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvite} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Colleague Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Sita Sharma"
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Email Address (Any Provider)
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. colleague@gmail.com or name@organization.org"
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-primary-700 focus:ring-4 focus:ring-primary-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wide text-ink uppercase">
                  Assigned Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-line-strong bg-card px-3.5 py-2.5 text-sm font-medium text-ink focus:border-primary-700 focus:outline-none"
                >
                  <option value="editor">Editor (Manage &amp; publish content)</option>
                  <option value="viewer">Viewer (Read-only draft preview)</option>
                  <option value="super_admin">Super Admin (Full administrative access)</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
                <input
                  type="checkbox"
                  checked={sendEmailToggle}
                  onChange={(e) => setSendEmailToggle(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-line-strong accent-primary-900"
                />
                <span className="text-xs leading-relaxed text-ink-2">
                  <strong className="block font-bold text-ink">
                    Send real password-setup email immediately
                  </strong>
                  Delivers an official password-setup link directly to their Gmail / email inbox so
                  they can set their own password and sign right in.
                </span>
              </label>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="h-10 rounded-full border border-line-strong px-4 text-xs font-semibold text-ink-2 hover:bg-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-primary-900 px-5 text-xs font-bold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {inviting ? <RefreshIcon size={14} className="animate-spin" /> : <MailIcon size={14} />}
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Invite Delivery & Quick-Share Modal */}
      {inviteDelivery && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-modal">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircleIcon size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink">Staff Invitation Ready</h2>
                  <p className="text-xs text-ink-2">
                    {inviteDelivery.name} ({inviteDelivery.email}) &middot;{' '}
                    <span className="font-semibold uppercase">
                      {inviteDelivery.role.replace('_', ' ')}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInviteDelivery(null)}
                className="rounded-lg p-1 text-ink-3 hover:bg-subtle hover:text-ink"
              >
                <XIcon size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {inviteDelivery.emailSent ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-900">
                  <p className="font-bold">
                    Real password-setup email dispatched to {inviteDelivery.email}!
                  </p>
                  <p className="mt-1 leading-relaxed text-emerald-800">
                    An email from <strong>noreply@heifer-academy-cms.firebaseapp.com</strong> has
                    been sent to their inbox. Once they click the link to set their password, they
                    can sign directly into the CMS. (Remind them to check Spam/Promotions if not
                    visible within 1 minute.)
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-accent-100 p-3.5 text-ochre">
                  <p className="font-bold">Staff access provisioned</p>
                  <p className="mt-1 leading-relaxed">
                    {inviteDelivery.emailError ||
                      'Share the CMS login link or temporary password below with your colleague.'}
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1 block font-bold tracking-wide text-ink uppercase">
                  CMS Sign-In Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteDelivery.cmsLoginUrl}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-2 font-mono text-xs text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => copyText(inviteDelivery.cmsLoginUrl, 'CMS Link')}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-card px-3 font-semibold text-ink hover:border-primary-700 hover:text-brand"
                  >
                    <CopyIcon size={13} />
                    Copy
                  </button>
                </div>
              </div>

              {inviteDelivery.temporaryPassword && (
                <div>
                  <label className="mb-1 block font-bold tracking-wide text-ink uppercase">
                    Optional Instant Temporary Password
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={inviteDelivery.temporaryPassword}
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-2 font-mono text-xs text-ink"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyText(inviteDelivery.temporaryPassword!, 'Temporary Password')
                      }
                      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-line-strong bg-card px-3 font-semibold text-ink hover:border-primary-700 hover:text-brand"
                    >
                      <CopyIcon size={13} />
                      Copy
                    </button>
                  </div>
                  <p className="mt-1 text-[0.7rem] text-ink-3">
                    They can either set their own password via the email sent to their inbox OR sign
                    in right away with this temporary password.
                  </p>
                </div>
              )}

              {(() => {
                const { gmailUrl, mailtoUrl } = buildWelcomeMailLinks(inviteDelivery)
                return (
                  <div className="rounded-xl border border-line bg-canvas p-3.5">
                    <p className="font-bold text-ink">
                      Optional: Send a Personal Welcome Note with the CMS Link
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <a
                        href={gmailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 font-semibold text-ink hover:border-primary-700 hover:text-brand"
                      >
                        <MailIcon size={13} />
                        Compose in Gmail
                        <ExternalIcon size={12} />
                      </a>
                      <a
                        href={mailtoUrl}
                        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 font-semibold text-ink hover:border-primary-700 hover:text-brand"
                      >
                        <MailIcon size={13} />
                        Open Default Mail App
                      </a>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="mt-6 flex justify-end border-t border-line pt-4">
              <button
                type="button"
                onClick={() => setInviteDelivery(null)}
                className="inline-flex h-10 items-center rounded-full bg-primary-900 px-6 text-xs font-bold text-white hover:bg-primary-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
