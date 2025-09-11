export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return ''

  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, 'blocked:')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

export function validateEmail(email) {
  if (!email) return { isValid: false, error: 'Email is required' }

  const sanitized = sanitizeInput(email)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email address is too long' }
  }

  return { isValid: true, sanitized: sanitized }
}

export function validatePassword(password) {
  if (!password) return { isValid: false, error: 'Password is required' }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' }
  }

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[@$!%*?&]/.test(password)

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return {
      isValid: false,
      error: 'Password must contain uppercase, lowercase, number, and special character',
    }
  }

  return { isValid: true }
}

export function validateName(name) {
  if (!name) return { isValid: false, error: 'Name is required' }

  const sanitized = sanitizeInput(name)

  if (sanitized.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' }
  }

  if (sanitized.length > 50) {
    return { isValid: false, error: 'Name cannot exceed 50 characters' }
  }

  const nameRegex = /^[a-zA-Z\s'\-]+$/
  if (!nameRegex.test(sanitized)) {
    return {
      isValid: false,
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    }
  }

  return { isValid: true, sanitized: sanitized }
}

export function checkRateLimit(action, maxAttempts = 5, windowMinutes = 5) {
  const key = `rateLimit_${action}`
  const now = Date.now()
  const windowMs = windowMinutes * 60 * 1000

  let attempts = JSON.parse(localStorage.getItem(key) || '[]')

  attempts = attempts.filter((timestamp) => now - timestamp < windowMs)

  if (attempts.length >= maxAttempts) {
    const remainingTime = Math.ceil((windowMs - (now - Math.min(...attempts))) / 1000)
    return {
      allowed: false,
      remainingTime: remainingTime,
      message: `Too many attempts. Please wait ${Math.ceil(remainingTime / 60)} minutes.`,
    }
  }

  attempts.push(now)
  localStorage.setItem(key, JSON.stringify(attempts))

  return { allowed: true, remainingAttempts: maxAttempts - attempts.length }
}

export function logSecurityEvent(eventType, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: sanitizeInput(eventType),
    details: sanitizeInput(JSON.stringify(details)),
    userAgent: navigator.userAgent.substring(0, 200),
    url: window.location.href,
  }

  try {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
    logs.push(logEntry)

    if (logs.length > 50) {
      logs.splice(0, logs.length - 50)
    }

    localStorage.setItem('securityLogs', JSON.stringify(logs))

    if (eventType.includes('SECURITY') || eventType.includes('ATTACK')) {
      console.warn('Security Event:', logEntry)
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}
