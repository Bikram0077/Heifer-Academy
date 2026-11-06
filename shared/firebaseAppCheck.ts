import type { FirebaseApp } from 'firebase/app'
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
  type AppCheck,
} from 'firebase/app-check'

export interface AppCheckConfig {
  siteKey?: string
  isEnterprise?: boolean
  debugToken?: boolean | string
  isTokenAutoRefreshEnabled?: boolean
}

let appCheckInstance: AppCheck | null = null

/**
 * Initializes Firebase App Check to protect Firestore endpoints from Denial of Wallet (DDoS)
 * and unauthorized API scraping by verifying that traffic originates from the official domain.
 */
export function initAppCheck(app: FirebaseApp, options: AppCheckConfig = {}): AppCheck | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (appCheckInstance) {
    return appCheckInstance
  }

  const isDev =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

  // Configure debug token in local development to prevent blocking during dev/testing
  if (isDev || options.debugToken) {
    const debugValue =
      typeof options.debugToken === 'string'
        ? options.debugToken
        : (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN || true
    // Global debug flag used by Firebase App Check SDK
    ;(self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string }).FIREBASE_APPCHECK_DEBUG_TOKEN = debugValue
  }

  const siteKey =
    options.siteKey ||
    (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY ||
    (import.meta as unknown as { env?: Record<string, string> })?.env?.VITE_FIREBASE_APPCHECK_SITE_KEY

  if (!siteKey) {
    if (!isDev) {
      console.warn(
        '[Firebase Security] App Check site key missing. Set VITE_RECAPTCHA_ENTERPRISE_SITE_KEY in production to enforce domain verification.'
      )
    }
    return null
  }

  try {
    const provider = options.isEnterprise !== false
      ? new ReCaptchaEnterpriseProvider(siteKey)
      : new ReCaptchaV3Provider(siteKey)

    appCheckInstance = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: options.isTokenAutoRefreshEnabled !== false,
    })

    return appCheckInstance
  } catch (err) {
    console.warn('[Firebase Security] App Check initialization failed:', err)
    return null
  }
}

