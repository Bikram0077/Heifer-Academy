import type { Role } from './schema'

export type ParsedAuthAction = {
  mode: 'resetPassword' | 'verifyEmail' | 'recoverEmail'
  oobCode: string
  continueUrl?: string
  lang?: string
}

/**
 * Generates a cryptographically strong, easy-to-read initial staff password
 * using Web Crypto CSPRNG (`crypto.getRandomValues`).
 */
export function generateStaffPassword(randomLength = 10): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const safeLen = Math.max(8, Math.min(24, randomLength))
  const buf = new Uint32Array(safeLen)
  crypto.getRandomValues(buf)
  let token = ''
  for (let i = 0; i < buf.length; i++) {
    token += alphabet[buf[i] % alphabet.length]
  }
  return `Ha!${token}9`
}

function normalizeActionMode(rawMode: string | null | undefined): ParsedAuthAction['mode'] {
  const cleaned = (rawMode || '').trim()
  if (cleaned === 'verifyEmail') return 'verifyEmail'
  if (cleaned === 'recoverEmail') return 'recoverEmail'
  // Default to resetPassword even if Firebase's hosted template left `mode` blank or mangled,
  // preventing the "The selected page mode is invalid" failure.
  return 'resetPassword'
}

function parseParamsFromQuery(search: string): URLSearchParams {
  const trimmed = search.startsWith('?') ? search.slice(1) : search
  return new URLSearchParams(trimmed)
}

/**
 * Extracts a Firebase out-of-band (`oobCode`) action from any of:
 * - Current browser URL query/hash (`?mode=resetPassword&oobCode=...`)
 * - A broken `firebaseapp.com/__/auth/action?...&apiKey=` link pasted by a user
 * - A wrapped `?link=https%3A%2F%2F...` redirect URL
 * - A raw `oobCode` token string
 */
export function extractFirebaseAuthAction(rawInput: string | null | undefined): ParsedAuthAction | null {
  if (!rawInput) return null
  const input = rawInput.trim()
  if (!input) return null

  const inspectParams = (params: URLSearchParams, depth = 0): ParsedAuthAction | null => {
    const directOob = params.get('oobCode')?.trim()
    if (directOob) {
      return {
        mode: normalizeActionMode(params.get('mode')),
        oobCode: directOob,
        continueUrl: params.get('continueUrl')?.trim() || undefined,
        lang: params.get('lang')?.trim() || undefined,
      }
    }

    // Unwrap nested `?link=...` or `?continueUrl=...` up to 2 levels deep
    if (depth < 2) {
      for (const nestedKey of ['link', 'deep_link_id', 'continueUrl']) {
        const nested = params.get(nestedKey)?.trim()
        if (nested && (nested.includes('oobCode=') || nested.includes('%3FoobCode%3D'))) {
          try {
            const decoded = nested.startsWith('http') ? nested : decodeURIComponent(nested)
            const parsedNested = extractFirebaseAuthAction(decoded)
            if (parsedNested) return parsedNested
          } catch {
            // Ignore malformed nested URI encoding
          }
        }
      }
    }

    return null
  }

  // Case 1: Full URL (`https://.../action?mode=resetPassword&oobCode=...`)
  if (/^https?:\/\//i.test(input)) {
    try {
      const url = new URL(input)
      const fromSearch = inspectParams(url.searchParams)
      if (fromSearch) return fromSearch

      const hashIdx = url.hash.indexOf('?')
      if (hashIdx >= 0) {
        const fromHash = inspectParams(parseParamsFromQuery(url.hash.slice(hashIdx)))
        if (fromHash) return fromHash
      }
    } catch {
      // Fall through to regex / query parsing
    }
  }

  // Case 2: Query string or URL fragment containing `oobCode=`
  if (input.includes('oobCode=')) {
    const qIdx = input.indexOf('?')
    const queryPart = qIdx >= 0 ? input.slice(qIdx + 1).split('#')[0] : input
    const fromQuery = inspectParams(parseParamsFromQuery(queryPart))
    if (fromQuery) return fromQuery
  }

  // Case 3: Raw oobCode token pasted directly (Firebase oobCodes are URL-safe tokens >= 20 chars)
  if (/^[A-Za-z0-9_-]{20,256}$/.test(input)) {
    return {
      mode: 'resetPassword',
      oobCode: input,
    }
  }

  return null
}

export type StaffCredentialsMailInput = {
  name: string
  email: string
  role: Role
  cmsLoginUrl: string
  password?: string
  resetEmailSent?: boolean
  adminName?: string
}

export type StaffCredentialsMailLinks = {
  roleLabel: string
  subject: string
  textBody: string
  credentialsSummary: string
  gmailUrl: string
  outlookUrl: string
  mailtoUrl: string
}

export function formatRoleLabel(role: Role): string {
  if (role === 'super_admin') return 'SUPER ADMIN'
  if (role === 'editor') return 'EDITOR'
  return 'VIEWER'
}

/**
 * Builds ready-to-send staff credential email content & compose links
 * (Gmail Web, Outlook Web, Default Mail Client, and copyable summary card).
 */
export function buildStaffCredentialsEmail(
  input: StaffCredentialsMailInput
): StaffCredentialsMailLinks {
  const roleLabel = formatRoleLabel(input.role)
  const cleanName = input.name.trim() || input.email.split('@')[0] || 'Colleague'
  const sender = input.adminName?.trim() || 'Heifer Academy Super Admin'
  const hasPassword = Boolean(input.password && input.password.trim())

  const subject = hasPassword
    ? `Your Heifer Academy CMS Login Credentials (${roleLabel})`
    : `Invitation to Heifer Academy CMS (${roleLabel})`

  const bodyLines = [
    `Hello ${cleanName},`,
    '',
    `Your staff account for the Heifer Academy Editorial & Content Studio (CMS) is active with ${roleLabel} access.`,
    '',
    ...(hasPassword
      ? [
          'Use the login credentials below to access the CMS immediately:',
          `• CMS Sign-In Link: ${input.cmsLoginUrl}`,
          `• Username (Email): ${input.email}`,
          `• Password: ${input.password}`,
          `• Assigned Role: ${roleLabel}`,
          '',
          'Simply open the CMS Sign-In Link above and sign in with your Username and Password.',
        ]
      : [
          `• CMS Sign-In Link: ${input.cmsLoginUrl}`,
          `• Username (Email): ${input.email}`,
          `• Assigned Role: ${roleLabel}`,
          '',
          input.resetEmailSent
            ? 'Check your inbox for the password setup email, or click "Set / Forgot password?" on the CMS Sign-In page.'
            : 'Open the CMS Sign-In Link above to access your staff account.',
        ]),
    '',
    'Warm regards,',
    sender,
    'Heifer Academy — Heifer International Nepal',
  ]

  const textBody = bodyLines.join('\n')

  const summaryLines = [
    'Heifer Academy CMS — Staff Login Credentials',
    `Name: ${cleanName}`,
    `Role: ${roleLabel}`,
    `CMS Login URL: ${input.cmsLoginUrl}`,
    `Username (Email): ${input.email}`,
    ...(hasPassword ? [`Password: ${input.password}`] : []),
  ]
  const credentialsSummary = summaryLines.join('\n')

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    input.email
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`

  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    input.email
  )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody)}`

  const mailtoUrl = `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`

  return {
    roleLabel,
    subject,
    textBody,
    credentialsSummary,
    gmailUrl,
    outlookUrl,
    mailtoUrl,
  }
}

