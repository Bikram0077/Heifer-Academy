import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  browserSessionPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type ActionCodeSettings,
  type Auth,
  type User,
  type MultiFactorResolver,
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { firebaseConfig } from '@shared/firebaseConfig'
import { extractFirebaseAuthAction } from '@shared/authAction'
import { auth, db } from '../firebase'
import type { Role, UserProfile, Invite } from '@shared/schema'
import { tokenStore } from '@shared/security/tokens'
import { validateSuperAdminPassword } from '@shared/security/passwordPolicy'
import {
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
} from '@shared/security/totp'
import {
  dispatchCredentialsViaRelay,
  getStoredStaffCredential,
  saveStoredStaffCredential,
  clearStaffCredentialVault,
} from '../utils/staffCredentialVault'

export type InviteStaffOptions = {
  customPassword?: string
  sendResetEmail?: boolean
}

export type InviteResult = {
  email: string
  name: string
  role: Role
  emailSent: boolean
  relayEmailSent?: boolean
  emailError?: string
  accountProvisioned: boolean
  temporaryPassword?: string
  cmsLoginUrl: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  role: Role | null
  isSuperAdmin: boolean
  isEditor: boolean
  isViewer: boolean
  isBootstrapped: boolean | null
  hasPendingInvite: boolean
  pendingInviteRole: Role | null
  loading: boolean
  error: string | null
  clearError: () => void
  mfaChallengeRequired: boolean
  isMfaVerified: boolean
  resolveMfaWithCode: (code: string) => Promise<void>
  cancelMfaChallenge: () => Promise<void>
  generateNewMfaSecret: () => { secret: string; uri: string }
  enableMfaForCurrentUser: (secret: string, verificationCode: string) => Promise<void>
  disableMfaForCurrentUser: (password: string) => Promise<void>
  testMfaCodeForCurrentUser: (code: string) => Promise<boolean>
  login: (email: string, pass: string) => Promise<void>
  logout: (redirectUrl?: string) => Promise<void>
  bootstrapSuperAdmin: (name: string, email: string, pass: string) => Promise<void>
  completeBootstrapForCurrentUser: (name: string) => Promise<void>
  signupWithInvite: (name: string, email: string, pass: string) => Promise<void>
  claimInviteForCurrentUser: (name: string) => Promise<void>
  inviteStaffByEmail: (
    name: string,
    email: string,
    role: Role,
    options?: boolean | InviteStaffOptions
  ) => Promise<InviteResult>
  sendStaffPasswordEmail: (email: string) => Promise<void>
  rotateStaffPasswordWithCurrent: (
    email: string,
    currentPassword: string,
    newPassword: string,
    staffMeta?: { name?: string; role?: Role }
  ) => Promise<void>
  verifyPasswordActionCode: (codeOrLink: string) => Promise<{
    email: string
    oobCode: string
    mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail'
  }>
  confirmPasswordResetWithCode: (
    codeOrLink: string,
    newPassword: string,
    options?: { autoSignIn?: boolean; staffName?: string; staffRole?: Role }
  ) => Promise<{ email: string }>
  updateDisplayName: (name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Isolated in-memory Firebase worker app so Super Admin can provision staff accounts,
// rotate passwords, and confirm action codes without disturbing the active Super Admin session.
let workerApp: FirebaseApp | null = null
let workerAuth: Auth | null = null
let workerDb: Firestore | null = null

function getInviteWorker(): { workerAuth: Auth; workerDb: Firestore } {
  if (!workerApp) {
    const existing = getApps().find((a) => a.name === 'cms-invite-worker')
    workerApp = existing || initializeApp(firebaseConfig, 'cms-invite-worker')
    try {
      workerAuth = initializeAuth(workerApp, { persistence: inMemoryPersistence })
    } catch {
      workerAuth = getAuth(workerApp)
    }
    workerDb = getFirestore(workerApp)
  }
  return { workerAuth: workerAuth!, workerDb: workerDb! }
}

function generateStrongTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const buf = new Uint32Array(10)
  crypto.getRandomValues(buf)
  let token = ''
  for (let i = 0; i < buf.length; i++) {
    token += alphabet[buf[i] % alphabet.length]
  }
  return `Ha!${token}9`
}

function getCmsLoginBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${window.location.pathname}`
  }
  return 'http://localhost:5174/'
}

function buildCmsActionCodeSettings(normalizedEmail: string): ActionCodeSettings | undefined {
  if (typeof window === 'undefined') return undefined
  const base = getCmsLoginBaseUrl()
  return {
    url: `${base}?email=${encodeURIComponent(normalizedEmail)}`,
    handleCodeInApp: false,
  }
}

async function sendResetEmailSafely(targetAuth: Auth, normalizedEmail: string): Promise<void> {
  const settings = buildCmsActionCodeSettings(normalizedEmail)
  if (settings) {
    try {
      await sendPasswordResetEmail(targetAuth, normalizedEmail, settings)
      return
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || ''
      if (
        code !== 'auth/unauthorized-continue-uri' &&
        code !== 'auth/invalid-continue-uri' &&
        code !== 'auth/missing-continue-uri'
      ) {
        throw err
      }
    }
  }
  await sendPasswordResetEmail(targetAuth, normalizedEmail)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isBootstrapped, setIsBootstrapped] = useState<boolean | null>(null)
  const [hasPendingInvite, setHasPendingInvite] = useState(false)
  const [pendingInviteRole, setPendingInviteRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null)
  const [mfaChallengeRequired, setMfaChallengeRequired] = useState(false)
  const [isMfaVerified, setIsMfaVerified] = useState<boolean>(false)

  // Listen to meta/bootstrap document (matches firestore.rules exists(bootstrapPath()))
  useEffect(() => {
    const metaRef = doc(db, 'meta', 'bootstrap')
    const unsub = onSnapshot(
      metaRef,
      (snap) => {
        setIsBootstrapped(snap.exists())
      },
      (err) => {
        console.warn('Could not read meta/bootstrap:', err)
        setIsBootstrapped(false)
      }
    )
    return () => unsub()
  }, [])

  // Listen to Firebase Auth state & staff profile document
  useEffect(() => {
    let unsubProfile: (() => void) | null = null

    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      if (unsubProfile) {
        unsubProfile()
        unsubProfile = null
      }

      setUser(fbUser)
      setHasPendingInvite(false)
      setPendingInviteRole(null)

      if (!fbUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const userDocRef = doc(db, 'users', fbUser.uid)
      unsubProfile = onSnapshot(
        userDocRef,
        async (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserProfile
            if (data.disabled) {
              await fbSignOut(auth)
              setProfile(null)
              setError('This administrator account has been disabled by a Super Admin.')
            } else {
              setProfile(data)
              if (data.mfaEnabled) {
                let verified = false
                try {
                  verified = window.sessionStorage.getItem('ha_cms_mfa_verified') === fbUser.uid
                } catch {}
                setIsMfaVerified(verified)
                setMfaChallengeRequired(!verified)
              } else {
                setIsMfaVerified(true)
                setMfaChallengeRequired(false)
              }
            }
            setHasPendingInvite(false)
            setPendingInviteRole(null)
          } else {
            setProfile(null)
            // Check if this signed-in user has a pending invitation and auto-activate if possible!
            if (fbUser.email) {
              const normalizedEmail = fbUser.email.toLowerCase()
              try {
                const inviteRef = doc(db, 'invites', normalizedEmail)
                const invSnap = await getDoc(inviteRef)
                if (invSnap.exists()) {
                  const inv = invSnap.data() as Invite
                  const autoName = (
                    inv.name?.trim() ||
                    fbUser.displayName?.trim() ||
                    normalizedEmail.split('@')[0] ||
                    'Staff Member'
                  ).slice(0, 80)

                  const autoProfile: UserProfile = {
                    email: normalizedEmail,
                    name: autoName,
                    role: inv.role || 'editor',
                    disabled: false,
                    createdAt: new Date().toISOString(),
                  }

                  try {
                    await setDoc(doc(db, 'users', fbUser.uid), autoProfile)
                    await deleteDoc(inviteRef)
                    setProfile(autoProfile)
                    setHasPendingInvite(false)
                    setPendingInviteRole(null)
                    setLoading(false)
                    return
                  } catch {
                    // Fallback to manual claim form if auto-claim couldn't run yet
                    setHasPendingInvite(true)
                    setPendingInviteRole(inv.role || 'editor')
                  }
                }
              } catch {
                // Ignore read failure if no invite
              }
            }
          }
          setLoading(false)
        },
        (err) => {
          console.error('Error fetching user profile:', err)
          setProfile(null)
          setLoading(false)
        }
      )
    })

    return () => {
      unsubAuth()
      if (unsubProfile) unsubProfile()
    }
  }, [])

  const login = async (email: string, pass: string) => {
    setError(null)
    setLoading(true)
    try {
      // Ensure credentials terminate upon closing browser or tab
      await setPersistence(auth, browserSessionPersistence)
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass)

      // Check whether user profile already has MFA enabled
      const profileSnap = await getDoc(doc(db, 'users', cred.user.uid))
      if (profileSnap.exists()) {
        const pData = profileSnap.data() as UserProfile
        if (pData.mfaEnabled) {
          let verified = false
          try {
            verified = window.sessionStorage.getItem('ha_cms_mfa_verified') === cred.user.uid
          } catch {}
          if (!verified) {
            setIsMfaVerified(false)
            setMfaChallengeRequired(true)
            return
          }
        }
      }

      setIsMfaVerified(true)
      setMfaChallengeRequired(false)
      try {
        const idToken = await cred.user.getIdToken()
        tokenStore.setAccessToken(idToken, 15 * 60)
      } catch {
        // Fallback gracefully
      }
      setMfaResolver(null)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err as any)
        setMfaResolver(resolver)
        setMfaChallengeRequired(true)
        setIsMfaVerified(false)
        setLoading(false)
        return
      }
      let msg = 'Invalid email or password. Please verify your credentials or contact your administrator.'
      if (e.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Access temporarily restricted. Please wait a moment and try again.'
      }
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const resolveMfaWithCode = async (totpCode: string) => {
    setError(null)
    setLoading(true)
    try {
      const cleanCode = totpCode.trim().replace(/\s+/g, '')
      if (!/^\d{6}$/.test(cleanCode)) {
        throw new Error('Please enter a valid 6-digit numeric verification code.')
      }

      // Case 1: Native GCP Identity Platform MFA if resolver is present
      if (mfaResolver) {
        const totpHint = mfaResolver.hints.find(
          (h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID
        )
        if (!totpHint) {
          throw new Error('No supported authenticator app factor enrolled for this account.')
        }

        const assertion = TotpMultiFactorGenerator.assertionForSignIn(
          totpHint.uid,
          cleanCode
        )
        const cred = await mfaResolver.resolveSignIn(assertion)
        try {
          const idToken = await cred.user.getIdToken()
          tokenStore.setAccessToken(idToken, 15 * 60)
          window.sessionStorage.setItem('ha_cms_mfa_verified', cred.user.uid)
        } catch {
          // Fallback gracefully
        }
        setMfaResolver(null)
        setMfaChallengeRequired(false)
        setIsMfaVerified(true)
        return
      }

      // Case 2: Profile-based RFC 6238 TOTP
      const activeUser = user || auth.currentUser
      if (!activeUser) {
        throw new Error('No active authentication session found. Please sign in again.')
      }

      let secret = profile?.mfaSecret
      if (!secret) {
        const uSnap = await getDoc(doc(db, 'users', activeUser.uid))
        if (uSnap.exists()) {
          secret = (uSnap.data() as UserProfile).mfaSecret
        }
      }

      if (!secret) {
        throw new Error('No two-factor authenticator key configured for this account.')
      }

      const isValid = await verifyTotpCode(cleanCode, secret)
      if (!isValid) {
        const msg = 'Invalid 6-digit verification code. Please check your authenticator app.'
        setError(msg)
        throw new Error(msg)
      }

      try {
        const idToken = await activeUser.getIdToken()
        tokenStore.setAccessToken(idToken, 15 * 60)
        window.sessionStorage.setItem('ha_cms_mfa_verified', activeUser.uid)
      } catch {
        // Fallback gracefully
      }

      setIsMfaVerified(true)
      setMfaChallengeRequired(false)
      setError(null)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      let msg = e.message || 'Two-factor verification failed. Please try again.'
      if (e.code === 'auth/invalid-verification-code') {
        msg = 'Invalid 6-digit verification code. Please check your authenticator app.'
      }
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const cancelMfaChallenge = async () => {
    setMfaResolver(null)
    setMfaChallengeRequired(false)
    setIsMfaVerified(false)
    setError(null)
    try {
      window.sessionStorage.removeItem('ha_cms_mfa_verified')
    } catch {}
    if (auth.currentUser) {
      try {
        await fbSignOut(auth)
      } catch {}
    }
  }

  const generateNewMfaSecret = () => {
    // 32 Base32 characters = 160 bits (20 bytes HMAC-SHA1 digest length)
    const secret = generateTotpSecret(32)
    const emailForUri = user?.email || profile?.email || 'admin@heifer.org'
    const uri = generateTotpUri(emailForUri, secret, 'Heifer Academy CMS')
    return { secret, uri }
  }

  const enableMfaForCurrentUser = async (secret: string, verificationCode: string) => {
    if (!user) throw new Error('You must be signed in to configure Two-Factor Authentication.')
    setError(null)
    const cleanCode = verificationCode.trim().replace(/\s+/g, '')
    if (!/^\d{6}$/.test(cleanCode)) {
      throw new Error('Please enter a 6-digit verification code.')
    }
    const isValid = await verifyTotpCode(cleanCode, secret, { window: 2 })
    if (!isValid) {
      throw new Error('Verification code incorrect. Please verify your authenticator app time and code.')
    }
    const enrolledAt = new Date().toISOString()
    await updateDoc(doc(db, 'users', user.uid), {
      mfaEnabled: true,
      mfaSecret: secret,
      mfaEnrolledAt: enrolledAt,
    })
    setProfile((prev) =>
      prev ? { ...prev, mfaEnabled: true, mfaSecret: secret, mfaEnrolledAt: enrolledAt } : prev
    )
    try {
      window.sessionStorage.setItem('ha_cms_mfa_verified', user.uid)
    } catch {}
    setIsMfaVerified(true)
    setMfaChallengeRequired(false)
  }

  const disableMfaForCurrentUser = async (password: string) => {
    if (!user || !user.email) throw new Error('You must be signed in to modify MFA settings.')
    setError(null)
    try {
      const cred = EmailAuthProvider.credential(user.email, password)
      await reauthenticateWithCredential(user, cred)
    } catch {
      throw new Error('Incorrect password. Please enter your current account password to disable 2FA.')
    }
    await updateDoc(doc(db, 'users', user.uid), {
      mfaEnabled: false,
      mfaSecret: '',
      mfaEnrolledAt: '',
    })
    setProfile((prev) =>
      prev ? { ...prev, mfaEnabled: false, mfaSecret: '', mfaEnrolledAt: '' } : prev
    )
    try {
      window.sessionStorage.removeItem('ha_cms_mfa_verified')
    } catch {}
    setIsMfaVerified(true)
    setMfaChallengeRequired(false)
  }

  const testMfaCodeForCurrentUser = async (code: string): Promise<boolean> => {
    const cleanCode = code.trim().replace(/\s+/g, '')
    if (!profile?.mfaSecret || !/^\d{6}$/.test(cleanCode)) return false
    return await verifyTotpCode(cleanCode, profile.mfaSecret)
  }

  const logout = async (redirectTarget?: string | unknown) => {
    const redirectUrl =
      typeof redirectTarget === 'string' && redirectTarget.startsWith('/')
        ? redirectTarget
        : '/admin/login'
    setError(null)
    try {
      await fbSignOut(auth)
    } catch (e) {
      console.warn('Sign out error:', e)
    }
    setProfile(null)
    setUser(null)
    tokenStore.clear()
    clearStaffCredentialVault()
    try {
      window.sessionStorage.removeItem('ha_cms_mfa_verified')
      window.sessionStorage.clear()
    } catch {
      // Ignore sessionStorage errors
    }
    setIsMfaVerified(false)
    setMfaChallengeRequired(false)

    if (typeof window !== 'undefined') {
      try {
        window.history.pushState(null, '', redirectUrl)
      } catch {
        // Ignore history pushState errors
      }
    }
  }

  const commitBootstrapBatch = async (uid: string, normalizedEmail: string, displayName: string) => {
    const now = new Date().toISOString()
    const cleanName = (displayName.trim() || normalizedEmail.split('@')[0] || 'Super Admin').slice(
      0,
      80
    )

    // Exact 5 keys required by firestore.rules: ['email', 'name', 'role', 'disabled', 'createdAt']
    const userProfile: UserProfile = {
      email: normalizedEmail,
      name: cleanName,
      role: 'super_admin',
      disabled: false,
      createdAt: now,
    }

    const batch = writeBatch(db)
    batch.set(doc(db, 'users', uid), userProfile)
    batch.set(doc(db, 'meta', 'bootstrap'), {
      uid,
      bootstrapped: true,
      bootstrappedAt: now,
      initialAdminEmail: normalizedEmail,
    })

    await batch.commit()
    setProfile(userProfile)
    setIsBootstrapped(true)
  }

  const bootstrapSuperAdmin = async (name: string, email: string, pass: string) => {
    setError(null)
    setLoading(true)
    try {
      const pwCheck = validateSuperAdminPassword(pass)
      if (!pwCheck.valid) {
        throw new Error(pwCheck.errors[0])
      }
      await setPersistence(auth, browserSessionPersistence)
      const normalizedEmail = email.trim().toLowerCase()
      let uid: string

      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass)
        uid = cred.user.uid
      } catch (authErr: unknown) {
        const ae = authErr as { code?: string }
        if (ae.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass)
          uid = cred.user.uid
        } else {
          throw authErr
        }
      }

      await commitBootstrapBatch(uid, normalizedEmail, name)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      let msg = e.message || 'Failed to initialize Super Admin account.'
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        msg =
          'An Auth account with this email already exists. Enter its existing password to complete Super Admin setup.'
      } else if (e.code === 'auth/weak-password') {
        msg = 'Password must be at least 6 characters long.'
      }
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const completeBootstrapForCurrentUser = async (name: string) => {
    const current = auth.currentUser
    if (!current || !current.email) {
      throw new Error('No signed-in user session found.')
    }
    setError(null)
    setLoading(true)
    try {
      await commitBootstrapBatch(current.uid, current.email.toLowerCase(), name)
    } catch (err: unknown) {
      const e = err as { message?: string }
      const msg = e.message || 'Failed to complete Super Admin setup.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const signupWithInvite = async (name: string, email: string, pass: string) => {
    setError(null)
    setLoading(true)
    try {
      const pwCheck = validateSuperAdminPassword(pass)
      if (!pwCheck.valid) {
        throw new Error(pwCheck.errors[0])
      }
      await setPersistence(auth, browserSessionPersistence)
      const normalizedEmail = email.trim().toLowerCase()
      let uid: string

      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, pass)
        uid = cred.user.uid
      } catch (authErr: unknown) {
        const ae = authErr as { code?: string }
        if (ae.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, normalizedEmail, pass)
          uid = cred.user.uid
        } else {
          throw authErr
        }
      }

      // If account was already provisioned by inviteStaffByEmail, users/{uid} already exists!
      const existingUserSnap = await getDoc(doc(db, 'users', uid))
      if (existingUserSnap.exists()) {
        setProfile(existingUserSnap.data() as UserProfile)
        setHasPendingInvite(false)
        setPendingInviteRole(null)
        return
      }

      const inviteRef = doc(db, 'invites', normalizedEmail)
      const inviteSnap = await getDoc(inviteRef)

      if (!inviteSnap.exists()) {
        await fbSignOut(auth)
        throw new Error(
          'No pending invitation found for this email address. Please ask a Super Admin to invite your email first.'
        )
      }

      const invite = inviteSnap.data() as Invite
      const cleanName = (
        name.trim() ||
        invite.name?.trim() ||
        normalizedEmail.split('@')[0] ||
        'Staff Member'
      ).slice(0, 80)

      const userProfile: UserProfile = {
        email: normalizedEmail,
        name: cleanName,
        role: invite.role || 'viewer',
        disabled: false,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', uid), userProfile)
      await deleteDoc(inviteRef)

      setProfile(userProfile)
      setHasPendingInvite(false)
      setPendingInviteRole(null)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      let msg = e.message || 'Invitation registration failed.'
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        msg =
          'Your account is already created! Sign in with the username and password sent by your Super Admin, or click "Set / Forgot password?" on the Sign In screen.'
      }
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const claimInviteForCurrentUser = async (name: string) => {
    const current = auth.currentUser
    if (!current || !current.email) {
      throw new Error('No signed-in user session found.')
    }
    setError(null)
    setLoading(true)
    try {
      const normalizedEmail = current.email.toLowerCase()
      const inviteRef = doc(db, 'invites', normalizedEmail)
      const inviteSnap = await getDoc(inviteRef)
      if (!inviteSnap.exists()) {
        throw new Error('No pending invitation found for your email address.')
      }
      const invite = inviteSnap.data() as Invite
      const cleanName = (
        name.trim() ||
        invite.name?.trim() ||
        normalizedEmail.split('@')[0] ||
        'Staff Member'
      ).slice(0, 80)

      const userProfile: UserProfile = {
        email: normalizedEmail,
        name: cleanName,
        role: invite.role || 'viewer',
        disabled: false,
        createdAt: new Date().toISOString(),
      }

      await setDoc(doc(db, 'users', current.uid), userProfile)
      await deleteDoc(inviteRef)

      setProfile(userProfile)
      setHasPendingInvite(false)
      setPendingInviteRole(null)
    } catch (err: unknown) {
      const e = err as { message?: string }
      const msg = e.message || 'Failed to activate invitation.'
      setError(msg)
      throw new Error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inviteStaffByEmail = async (
    name: string,
    email: string,
    role: Role,
    options?: boolean | InviteStaffOptions
  ): Promise<InviteResult> => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      throw new Error(
        'Please enter a valid email address (Gmail, Outlook, Yahoo, organization domain, etc.).'
      )
    }
    if (profile?.role !== 'super_admin') {
      throw new Error('Only Super Admins can invite staff members.')
    }

    const opts: InviteStaffOptions =
      typeof options === 'boolean'
        ? { sendResetEmail: options }
        : options || { sendResetEmail: false }

    const chosenPassword = opts.customPassword?.trim() || generateStrongTempPassword()
    if (chosenPassword.length < 6) {
      throw new Error('Staff password must be at least 6 characters long.')
    }

    const cleanName = (
      name.trim() ||
      normalizedEmail.split('@')[0] ||
      'Staff Member'
    ).slice(0, 80)
    const now = new Date().toISOString()

    // 1. Write invitation record in Firestore (accepted for ANY lowercase email domain per firestore.rules)
    const inviteDoc: Invite = {
      email: normalizedEmail,
      name: cleanName,
      role,
      invitedBy: profile?.email || user?.email || 'super_admin',
      invitedAt: now,
    }
    await setDoc(doc(db, 'invites', normalizedEmail), inviteDoc)

    const baseOrigin = getCmsLoginBaseUrl()
    const cmsLoginUrl = `${baseOrigin}?email=${encodeURIComponent(normalizedEmail)}`

    // 2. Provision Firebase Auth user with Username (email) + Password via isolated worker app
    const { workerAuth: wAuth, workerDb: wDb } = getInviteWorker()
    let accountProvisioned = false
    let emailSent = false
    let relayEmailSent = false
    let emailError: string | undefined

    try {
      try {
        const cred = await createUserWithEmailAndPassword(wAuth, normalizedEmail, chosenPassword)
        const staffProfile: UserProfile = {
          email: normalizedEmail,
          name: cleanName,
          role,
          disabled: false,
          createdAt: now,
        }
        await setDoc(doc(wDb, 'users', cred.user.uid), staffProfile)
        await deleteDoc(doc(wDb, 'invites', normalizedEmail))
        accountProvisioned = true
      } catch (createErr: unknown) {
        const ce = createErr as { code?: string; message?: string }
        if (ce.code === 'auth/email-already-in-use') {
          // Try rotating/re-syncing if we have their stored credential or matching password
          const stored = getStoredStaffCredential(normalizedEmail)
          const candidatePasswords = Array.from(
            new Set([stored?.password, chosenPassword].filter(Boolean) as string[])
          )

          for (const candidatePass of candidatePasswords) {
            try {
              const existingCred = await signInWithEmailAndPassword(
                wAuth,
                normalizedEmail,
                candidatePass
              )
              if (candidatePass !== chosenPassword) {
                await updatePassword(existingCred.user, chosenPassword)
              }
              const existingDoc = await getDoc(doc(wDb, 'users', existingCred.user.uid))
              if (!existingDoc.exists()) {
                await setDoc(doc(wDb, 'users', existingCred.user.uid), {
                  email: normalizedEmail,
                  name: cleanName,
                  role,
                  disabled: false,
                  createdAt: now,
                })
              } else if (existingCred.user.uid !== user?.uid) {
                await updateDoc(doc(db, 'users', existingCred.user.uid), {
                  role,
                  disabled: false,
                }).catch(() => {})
              }
              await deleteDoc(doc(db, 'invites', normalizedEmail)).catch(() => {})
              accountProvisioned = true
              break
            } catch {
              // Candidate password didn't match; continue
            }
          }
        } else if (ce.code === 'auth/invalid-email') {
          await deleteDoc(doc(db, 'invites', normalizedEmail)).catch(() => {})
          throw new Error('Invalid email address format.')
        } else if (ce.code === 'auth/weak-password') {
          await deleteDoc(doc(db, 'invites', normalizedEmail)).catch(() => {})
          throw new Error('Password must be at least 6 characters long.')
        } else {
          console.warn('Worker account pre-provisioning fallback to invite record:', ce)
        }
      }

      if (accountProvisioned) {
        saveStoredStaffCredential({
          email: normalizedEmail,
          name: cleanName,
          role,
          password: chosenPassword,
          cmsLoginUrl,
          updatedAt: now,
        })

        // Dispatch credentials via configured Automatic Email Relay if enabled
        const relayRes = await dispatchCredentialsViaRelay({
          name: cleanName,
          email: normalizedEmail,
          role,
          cmsLoginUrl,
          password: chosenPassword,
          adminName: profile?.name || 'Heifer Academy Super Admin',
        })
        if (relayRes.sent) {
          relayEmailSent = true
          emailSent = true
        } else if (relayRes.error) {
          emailError = relayRes.error
        }
      }

      // Send Firebase password-reset email only if explicitly requested or if account existed without known password
      if (opts.sendResetEmail || (!accountProvisioned && opts.sendResetEmail !== false)) {
        try {
          await sendResetEmailSafely(wAuth, normalizedEmail)
          emailSent = true
        } catch (mailErr: unknown) {
          const me = mailErr as { message?: string }
          emailError = me.message || 'Could not dispatch automatic setup email.'
        }
      }
    } finally {
      await fbSignOut(wAuth).catch(() => {})
    }

    return {
      email: normalizedEmail,
      name: cleanName,
      role,
      emailSent,
      relayEmailSent,
      emailError,
      accountProvisioned,
      temporaryPassword: accountProvisioned ? chosenPassword : undefined,
      cmsLoginUrl,
    }
  }

  const sendStaffPasswordEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) throw new Error('Email address is required.')
    await sendResetEmailSafely(auth, normalizedEmail)
  }

  const rotateStaffPasswordWithCurrent = async (
    email: string,
    currentPassword: string,
    newPassword: string,
    staffMeta?: { name?: string; role?: Role }
  ) => {
    const normalizedEmail = email.trim().toLowerCase()
    const cleanNew = newPassword.trim()
    if (cleanNew.length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    const { workerAuth: wAuth } = getInviteWorker()
    try {
      const cred = await signInWithEmailAndPassword(wAuth, normalizedEmail, currentPassword)
      await updatePassword(cred.user, cleanNew)
      const cmsLoginUrl = `${getCmsLoginBaseUrl()}?email=${encodeURIComponent(normalizedEmail)}`
      const prev = getStoredStaffCredential(normalizedEmail)
      saveStoredStaffCredential({
        email: normalizedEmail,
        name: staffMeta?.name || prev?.name || normalizedEmail.split('@')[0] || 'Staff Member',
        role: staffMeta?.role || prev?.role || 'editor',
        password: cleanNew,
        cmsLoginUrl,
        updatedAt: new Date().toISOString(),
      })
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/invalid-credential' || e.code === 'auth/wrong-password') {
        throw new Error(
          'Current password did not match Firebase Auth (the staff member may have already changed it).'
        )
      }
      throw new Error(e.message || 'Failed to update staff password.')
    } finally {
      await fbSignOut(wAuth).catch(() => {})
    }
  }

  const verifyPasswordActionCode = async (codeOrLink: string) => {
    const parsed = extractFirebaseAuthAction(codeOrLink)
    if (!parsed) {
      throw new Error(
        'Could not find a valid password reset code (oobCode) in that link. Please paste the full link from the Firebase reset email.'
      )
    }

    const { workerAuth: wAuth } = getInviteWorker()
    try {
      if (parsed.mode === 'verifyEmail') {
        await applyActionCode(wAuth, parsed.oobCode)
        return { email: '', oobCode: parsed.oobCode, mode: 'verifyEmail' as const }
      }
      const verifiedEmail = await verifyPasswordResetCode(wAuth, parsed.oobCode)
      return {
        email: verifiedEmail.toLowerCase(),
        oobCode: parsed.oobCode,
        mode: 'resetPassword' as const,
      }
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/expired-action-code') {
        throw new Error(
          'This password reset link has expired. Please send a fresh reset email and try again.'
        )
      }
      if (e.code === 'auth/invalid-action-code') {
        throw new Error(
          'This password reset link was already used or is invalid. Please request a fresh reset link.'
        )
      }
      throw new Error(e.message || 'Invalid or expired password reset code.')
    }
  }

  const confirmPasswordResetWithCode = async (
    codeOrLink: string,
    newPassword: string,
    options?: { autoSignIn?: boolean; staffName?: string; staffRole?: Role }
  ): Promise<{ email: string }> => {
    const cleanPassword = newPassword.trim()
    if (cleanPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    const parsed = extractFirebaseAuthAction(codeOrLink)
    if (!parsed) {
      throw new Error('Missing or invalid password reset code (oobCode).')
    }

    const { workerAuth: wAuth } = getInviteWorker()
    let verifiedEmail = ''
    try {
      verifiedEmail = (await verifyPasswordResetCode(wAuth, parsed.oobCode)).toLowerCase()
      await confirmPasswordReset(wAuth, parsed.oobCode, cleanPassword)
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string }
      if (e.code === 'auth/expired-action-code') {
        throw new Error('This password reset link has expired. Request a new reset email.')
      }
      if (e.code === 'auth/invalid-action-code') {
        throw new Error('This reset link has already been used or is invalid.')
      }
      if (e.code === 'auth/weak-password') {
        throw new Error('Password must be at least 6 characters long.')
      }
      throw new Error(e.message || 'Failed to set new password.')
    } finally {
      await fbSignOut(wAuth).catch(() => {})
    }

    if (options?.autoSignIn) {
      await setPersistence(auth, browserSessionPersistence)
      await signInWithEmailAndPassword(auth, verifiedEmail, cleanPassword)
    } else {
      const cmsLoginUrl = `${getCmsLoginBaseUrl()}?email=${encodeURIComponent(verifiedEmail)}`
      saveStoredStaffCredential({
        email: verifiedEmail,
        name: options?.staffName || verifiedEmail.split('@')[0] || 'Staff Member',
        role: options?.staffRole || 'editor',
        password: cleanPassword,
        cmsLoginUrl,
        updatedAt: new Date().toISOString(),
      })
    }

    return { email: verifiedEmail }
  }

  const updateDisplayName = async (name: string) => {
    if (!user) throw new Error('Not signed in.')
    const cleanName = name.trim().slice(0, 80)
    if (!cleanName) throw new Error('Display name cannot be empty.')
    await updateDoc(doc(db, 'users', user.uid), { name: cleanName })
  }

  const resetPassword = async (email: string) => {
    setError(null)
    try {
      const normalized = email.trim().toLowerCase()
      if (!normalized) throw new Error('Please enter your email address.')
      await sendResetEmailSafely(auth, normalized)
    } catch (err: unknown) {
      const e = err as { message?: string }
      const msg = e.message || 'Failed to send password reset email.'
      setError(msg)
      throw new Error(msg)
    }
  }

  const role = profile?.role ?? null
  const isSuperAdmin = role === 'super_admin'
  const isEditor = role === 'editor' || isSuperAdmin
  const isViewer = !!role

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isSuperAdmin,
        isEditor,
        isViewer,
        isBootstrapped,
        hasPendingInvite,
        pendingInviteRole,
        loading,
        error,
        clearError: () => setError(null),
        mfaChallengeRequired,
        isMfaVerified,
        resolveMfaWithCode,
        cancelMfaChallenge,
        generateNewMfaSecret,
        enableMfaForCurrentUser,
        disableMfaForCurrentUser,
        testMfaCodeForCurrentUser,
        login,
        logout,
        bootstrapSuperAdmin,
        completeBootstrapForCurrentUser,
        signupWithInvite,
        claimInviteForCurrentUser,
        inviteStaffByEmail,
        sendStaffPasswordEmail,
        rotateStaffPasswordWithCurrent,
        verifyPasswordActionCode,
        confirmPasswordResetWithCode,
        updateDisplayName,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
