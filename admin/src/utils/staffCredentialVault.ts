import type { Role } from '@shared/schema'
import { buildStaffCredentialsEmail, formatRoleLabel } from '@shared/authAction'

const VAULT_STORAGE_KEY = 'ha_cms_staff_creds_v1'
const RELAY_STORAGE_KEY = 'ha_cms_email_relay_v1'

export type StoredStaffCredential = {
  email: string
  name: string
  role: Role
  password: string
  cmsLoginUrl: string
  updatedAt: string
}

export type EmailRelayConfig = {
  enabled: boolean
  provider: 'apps_script_webhook' | 'emailjs'
  webhookUrl?: string
  emailJsServiceId?: string
  emailJsTemplateId?: string
  emailJsPublicKey?: string
}

export function loadStaffCredentialVault(): Record<string, StoredStaffCredential> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, StoredStaffCredential>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function getStoredStaffCredential(email: string): StoredStaffCredential | null {
  const key = email.trim().toLowerCase()
  if (!key) return null
  const vault = loadStaffCredentialVault()
  return vault[key] || null
}

export function saveStoredStaffCredential(entry: StoredStaffCredential): void {
  if (typeof window === 'undefined') return
  const key = entry.email.trim().toLowerCase()
  if (!key || !entry.password) return
  try {
    const vault = loadStaffCredentialVault()
    vault[key] = {
      ...entry,
      email: key,
    }
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault))
  } catch {
    // Ignore storage quota / private mode errors
  }
}

export function removeStoredStaffCredential(email: string): void {
  if (typeof window === 'undefined') return
  const key = email.trim().toLowerCase()
  try {
    const vault = loadStaffCredentialVault()
    delete vault[key]
    window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(vault))
  } catch {
    // Ignore storage errors
  }
}

export function loadEmailRelayConfig(): EmailRelayConfig {
  if (typeof window === 'undefined') {
    return { enabled: false, provider: 'apps_script_webhook' }
  }
  try {
    const raw = window.localStorage.getItem(RELAY_STORAGE_KEY)
    if (!raw) return { enabled: false, provider: 'apps_script_webhook' }
    const parsed = JSON.parse(raw) as Partial<EmailRelayConfig>
    return {
      enabled: Boolean(parsed.enabled),
      provider: parsed.provider === 'emailjs' ? 'emailjs' : 'apps_script_webhook',
      webhookUrl: parsed.webhookUrl || '',
      emailJsServiceId: parsed.emailJsServiceId || '',
      emailJsTemplateId: parsed.emailJsTemplateId || '',
      emailJsPublicKey: parsed.emailJsPublicKey || '',
    }
  } catch {
    return { enabled: false, provider: 'apps_script_webhook' }
  }
}

export function saveEmailRelayConfig(config: EmailRelayConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(RELAY_STORAGE_KEY, JSON.stringify(config))
  } catch {
    // Ignore storage errors
  }
}

export function isEmailRelayReady(config = loadEmailRelayConfig()): boolean {
  if (!config.enabled) return false
  if (config.provider === 'emailjs') {
    return Boolean(
      config.emailJsServiceId?.trim() &&
        config.emailJsTemplateId?.trim() &&
        config.emailJsPublicKey?.trim()
    )
  }
  return Boolean(config.webhookUrl?.trim() && /^https?:\/\//i.test(config.webhookUrl.trim()))
}

export async function dispatchCredentialsViaRelay(params: {
  name: string
  email: string
  role: Role
  cmsLoginUrl: string
  password?: string
  adminName?: string
}): Promise<{ sent: boolean; error?: string }> {
  const config = loadEmailRelayConfig()
  if (!isEmailRelayReady(config)) {
    return { sent: false }
  }

  const composed = buildStaffCredentialsEmail({
    name: params.name,
    email: params.email,
    role: params.role,
    cmsLoginUrl: params.cmsLoginUrl,
    password: params.password,
    adminName: params.adminName,
  })

  try {
    if (config.provider === 'emailjs') {
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: config.emailJsServiceId?.trim(),
          template_id: config.emailJsTemplateId?.trim(),
          user_id: config.emailJsPublicKey?.trim(),
          template_params: {
            to_email: params.email,
            to_name: params.name,
            role: formatRoleLabel(params.role),
            cms_url: params.cmsLoginUrl,
            username: params.email,
            password: params.password || '',
            subject: composed.subject,
            message: composed.textBody,
            invited_by: params.adminName || 'Heifer Academy Super Admin',
          },
        }),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => '')
        return { sent: false, error: errText || `EmailJS returned HTTP ${res.status}` }
      }
      return { sent: true }
    }

    const targetUrl = config.webhookUrl!.trim()
    const isGoogleAppsScript = targetUrl.includes('script.google.com')
    const payload = {
      to: params.email,
      name: params.name,
      role: formatRoleLabel(params.role),
      cmsLoginUrl: params.cmsLoginUrl,
      username: params.email,
      password: params.password || '',
      subject: composed.subject,
      body: composed.textBody,
    }

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        // text/plain avoids CORS preflight rejection on Google Apps Script Web Apps
        'Content-Type': isGoogleAppsScript
          ? 'text/plain;charset=utf-8'
          : 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      return { sent: false, error: `Relay returned HTTP ${res.status}` }
    }
    return { sent: true }
  } catch (err: unknown) {
    const e = err as { message?: string }
    return { sent: false, error: e.message || 'Automatic email relay request failed.' }
  }
}

export const GOOGLE_APPS_SCRIPT_SNIPPET = `function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  MailApp.sendEmail({
    to: data.to,
    subject: data.subject,
    body: data.body,
    name: "Heifer Academy CMS"
  });
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}`

