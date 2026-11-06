/**
 * Heifer Academy Security Suite — Password Policy & Complexity Engine
 *
 * Enforces strong password rules for administrative accounts to prevent
 * credential stuffing, dictionary attacks, and account takeover (OWASP A07).
 */

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  score: number // 0-4 strength score
}

const COMMON_DISALLOWED_SUBSTRINGS = [
  'password',
  'heifer',
  'nepal',
  'admin',
  '123456',
  'qwerty',
  'academy',
]

/**
 * Validates password complexity for Super Admin and Staff accounts.
 *
 * Requirements:
 * - Minimum 10 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*...)
 * - No common dictionary substrings
 */
export function validateSuperAdminPassword(password: string): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required.'], score: 0 }
  }

  // Length requirement
  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long.')
  } else {
    score += 1
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).')
  } else {
    score += 1
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).')
  } else {
    score += 1
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).')
  } else {
    score += 1
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).')
  }

  // Common substring / dictionary check
  const lower = password.toLowerCase()
  for (const common of COMMON_DISALLOWED_SUBSTRINGS) {
    if (lower.includes(common)) {
      errors.push(`Password cannot contain easily guessable words like "${common}".`)
      score = Math.max(0, score - 1)
      break
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    score: Math.min(4, score),
  }
}

