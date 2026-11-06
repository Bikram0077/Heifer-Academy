import { useState, useEffect, useCallback } from 'react'

const MAX_FAILED_ATTEMPTS = 5
const BASE_COOLDOWN_SECONDS = 60

interface RateLimiterState {
  failedAttempts: number
  lockedUntil: number | null
}

const STORAGE_KEY = 'ha_cms_login_rate_limit_v1'

function getInitialState(): RateLimiterState {
  if (typeof window === 'undefined') {
    return { failedAttempts: 0, lockedUntil: null }
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { failedAttempts: 0, lockedUntil: null }
    const parsed = JSON.parse(raw) as RateLimiterState
    return parsed && typeof parsed === 'object' ? parsed : { failedAttempts: 0, lockedUntil: null }
  } catch {
    return { failedAttempts: 0, lockedUntil: null }
  }
}

function persistState(state: RateLimiterState) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota
  }
}

/**
 * Custom hook implementing client-side exponential backoff and rate limiting
 * to prevent automated brute-force attacks and credential stuffing (OWASP A07).
 */
export function useLoginRateLimiter() {
  const [state, setState] = useState<RateLimiterState>(getInitialState)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)

  // Compute active cooldown
  useEffect(() => {
    if (!state.lockedUntil) {
      setRemainingSeconds(0)
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(0, Math.ceil((state.lockedUntil! - now) / 1000))
      setRemainingSeconds(diff)
      if (diff === 0) {
        // Cooldown completed
        setState((prev) => {
          const next = { ...prev, lockedUntil: null }
          persistState(next)
          return next
        })
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [state.lockedUntil])

  const recordFailedAttempt = useCallback(() => {
    setState((prev) => {
      const nextCount = prev.failedAttempts + 1
      let nextLockedUntil: number | null = null

      if (nextCount >= MAX_FAILED_ATTEMPTS) {
        // Compute exponential backoff: 60s, 120s, 240s...
        const multiplier = Math.pow(2, Math.min(nextCount - MAX_FAILED_ATTEMPTS, 3))
        const cooldownMs = BASE_COOLDOWN_SECONDS * 1000 * multiplier
        nextLockedUntil = Date.now() + cooldownMs
      }

      const nextState: RateLimiterState = {
        failedAttempts: nextCount,
        lockedUntil: nextLockedUntil,
      }
      persistState(nextState)
      return nextState
    })
  }, [])

  const resetRateLimit = useCallback(() => {
    const fresh: RateLimiterState = { failedAttempts: 0, lockedUntil: null }
    setState(fresh)
    setRemainingSeconds(0)
    persistState(fresh)
  }, [])

  const isLocked = remainingSeconds > 0

  return {
    isLocked,
    remainingSeconds,
    failedAttempts: state.failedAttempts,
    maxAttempts: MAX_FAILED_ATTEMPTS,
    recordFailedAttempt,
    resetRateLimit,
  }
}

