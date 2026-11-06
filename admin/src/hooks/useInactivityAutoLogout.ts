import { useEffect, useRef, useCallback } from 'react'

export const DEFAULT_INACTIVITY_LIMIT_MS = 15 * 60 * 1000 // 15 minutes
export const LAST_ACTIVITY_STORAGE_KEY = 'ha_cms_last_activity_v1'

export interface UseInactivityAutoLogoutOptions {
  enabled: boolean
  onTimeout: () => void | Promise<void>
  timeoutMs?: number
}

/**
 * Global inactivity timer hook for Heifer Academy CMS.
 * Tracks user interaction (mousedown, keydown, scroll) and automatically
 * logs out the user and clears session state after 15 minutes of inactivity.
 */
export function useInactivityAutoLogout({
  enabled,
  onTimeout,
  timeoutMs = DEFAULT_INACTIVITY_LIMIT_MS,
}: UseInactivityAutoLogoutOptions): { resetTimer: () => void } {
  const timeoutRef = useRef<number | null>(null)
  const onTimeoutRef = useRef(onTimeout)
  onTimeoutRef.current = onTimeout

  const triggerLogout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    try {
      window.sessionStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY)
    } catch {
      // Ignore sessionStorage errors
    }
    onTimeoutRef.current()
  }, [])

  const resetTimer = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
    }

    const now = Date.now()
    try {
      window.sessionStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString())
    } catch {
      // Ignore storage errors
    }

    timeoutRef.current = window.setTimeout(() => {
      triggerLogout()
    }, timeoutMs)
  }, [enabled, timeoutMs, triggerLogout])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      return
    }

    // Check if previous session already expired while tab was closed/hidden
    try {
      const storedLast = window.sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)
      if (storedLast) {
        const elapsed = Date.now() - parseInt(storedLast, 10)
        if (elapsed >= timeoutMs) {
          triggerLogout()
          return
        }
      }
    } catch {
      // Ignore storage errors
    }

    // Start timer immediately upon activation
    resetTimer()

    // Activity event throttle to prevent excessive timer churn during fast scroll/typing
    let lastHandled = 0
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastHandled > 1000) {
        lastHandled = now
        resetTimer()
      }
    }

    // Listeners for mandatory events: mousedown, keydown, scroll (+ touchstart)
    const trackedEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    trackedEvents.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true, capture: true })
    })

    // Also verify elapsed time whenever user switches back to the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        try {
          const stored = window.sessionStorage.getItem(LAST_ACTIVITY_STORAGE_KEY)
          if (stored) {
            const elapsed = Date.now() - parseInt(stored, 10)
            if (elapsed >= timeoutMs) {
              triggerLogout()
              return
            }
          }
        } catch {}
        resetTimer()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      trackedEvents.forEach((evt) => {
        window.removeEventListener(evt, handleActivity, true)
      })
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, timeoutMs, resetTimer, triggerLogout])

  return { resetTimer }
}
