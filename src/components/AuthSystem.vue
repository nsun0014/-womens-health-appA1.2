<template>
  <div class="bg-primary text-white py-3 mb-4">
    <div class="container text-center">
      <h3><i class="fas fa-user-shield me-2"></i>Welcome to WomenCare</h3>
      <p class="mb-0">Join our community or sign in to access personalized health features</p>
    </div>
  </div>

  <div class="container mt-4">
    <div class="alert alert-info mb-4">
      <div class="d-flex align-items-start">
        <i class="fas fa-shield-alt me-3 mt-1"></i>
        <div>
          <h6 class="mb-1">Your Security is Our Priority</h6>
          <small>
            We use advanced validation and security measures to protect your account. All inputs are
            sanitized and validated for your safety.
          </small>
        </div>
      </div>
    </div>

    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card">
          <div class="card-header text-center">
            <ul class="nav nav-tabs card-header-tabs">
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'login' }"
                  @click="switchTab('login')"
                >
                  <i class="fas fa-sign-in-alt me-1"></i>Login
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'register' }"
                  @click="switchTab('register')"
                >
                  <i class="fas fa-user-plus me-1"></i>Register
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <div v-if="activeTab === 'login'">
              <h4 class="text-center mb-4">
                <i class="fas fa-lock me-2 text-primary"></i>Secure Login
              </h4>

              <div v-if="rateLimitWarning" class="alert alert-warning mb-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                {{ rateLimitMessage }}
              </div>

              <form @submit.prevent="login" novalidate>
                <div class="mb-3">
                  <label class="form-label">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      :class="getValidationClass('login', 'email')"
                      v-model="loginForm.email"
                      @blur="validateLoginField('email')"
                      @input="clearLoginError('email')"
                      :disabled="rateLimitWarning"
                      autocomplete="email"
                      maxlength="254"
                      required
                    />
                  </div>
                  <div v-if="loginErrors.email" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ loginErrors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-key"></i>
                    </span>
                    <input
                      :type="showLoginPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="getValidationClass('login', 'password')"
                      v-model="loginForm.password"
                      @blur="validateLoginField('password')"
                      @input="clearLoginError('password')"
                      :disabled="rateLimitWarning"
                      autocomplete="current-password"
                      maxlength="128"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showLoginPassword = !showLoginPassword"
                      :disabled="rateLimitWarning"
                    >
                      <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="loginErrors.password" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ loginErrors.password }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="rememberMe"
                    id="rememberMe"
                  />
                  <label class="form-check-label" for="rememberMe"> Remember me for 30 days </label>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100"
                  :disabled="loginLoading || rateLimitWarning || !isLoginFormValid"
                >
                  <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loginLoading ? 'Signing In...' : 'Login' }}
                </button>

                <div class="position-relative my-4">
                  <hr class="my-0" />
                  <span
                    class="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small"
                  >
                    OR
                  </span>
                </div>

                <button
                  type="button"
                  class="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                  @click="loginWithGoogle"
                  :disabled="loginLoading || rateLimitWarning"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path
                      fill="#4285F4"
                      d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
                    />
                    <path
                      fill="#34A853"
                      d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"
                    />
                    <path
                      fill="#EA4335"
                      d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"
                    />
                  </svg>
                  <span v-if="loginLoading">Signing in with Google...</span>
                  <span v-else>Continue with Google</span>
                </button>
              </form>
            </div>

            <div v-else>
              <h4 class="text-center mb-4">
                <i class="fas fa-user-plus me-2 text-success"></i>Create Account
              </h4>

              <div v-if="registerForm.password" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-muted">Password Strength:</small>
                  <small :class="passwordStrengthClass">{{ passwordStrengthText }}</small>
                </div>
                <div class="progress" style="height: 5px">
                  <div
                    class="progress-bar"
                    :class="passwordStrengthClass.replace('text-', 'bg-')"
                    :style="{ width: passwordStrengthPercent + '%' }"
                  ></div>
                </div>
              </div>

              <form @submit.prevent="register" novalidate>
                <div class="mb-3">
                  <label class="form-label">Full Name *</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-user"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control"
                      :class="getValidationClass('register', 'name')"
                      v-model="registerForm.name"
                      @blur="validateRegisterField('name')"
                      @input="clearRegisterError('name')"
                      autocomplete="name"
                      maxlength="50"
                      required
                    />
                  </div>
                  <div v-if="registerErrors.name" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ registerErrors.name }}
                  </div>
                  <div v-else class="form-text">{{ registerForm.name.length }}/50 characters</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email *</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      :class="getValidationClass('register', 'email')"
                      v-model="registerForm.email"
                      @blur="validateRegisterField('email')"
                      @input="clearRegisterError('email')"
                      autocomplete="email"
                      maxlength="254"
                      required
                    />
                  </div>
                  <div v-if="registerErrors.email" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ registerErrors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Password *</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-key"></i>
                    </span>
                    <input
                      :type="showRegisterPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="getValidationClass('register', 'password')"
                      v-model="registerForm.password"
                      @blur="validateRegisterField('password')"
                      @input="onPasswordInput"
                      autocomplete="new-password"
                      maxlength="128"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showRegisterPassword = !showRegisterPassword"
                    >
                      <i :class="showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="registerErrors.password" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ registerErrors.password }}
                  </div>
                  <div v-else class="form-text">
                    Password must contain: uppercase, lowercase, number, and special character (8+
                    chars)
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Confirm Password *</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-check-double"></i>
                    </span>
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-control"
                      :class="getValidationClass('register', 'confirmPassword')"
                      v-model="registerForm.confirmPassword"
                      @blur="validateRegisterField('confirmPassword')"
                      @input="clearRegisterError('confirmPassword')"
                      autocomplete="new-password"
                      maxlength="128"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="registerErrors.confirmPassword" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i
                    >{{ registerErrors.confirmPassword }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Role *</label>
                  <select
                    class="form-select"
                    :class="getValidationClass('register', 'role')"
                    v-model="registerForm.role"
                    @blur="validateRegisterField('role')"
                    @change="clearRegisterError('role')"
                    required
                  >
                    <option value="">Select your role</option>
                    <option value="user">User - Access health profiles and rating features</option>
                    <option value="admin">
                      Administrator - Full system access and user management
                    </option>
                  </select>
                  <div v-if="registerErrors.role" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ registerErrors.role }}
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="acceptTerms"
                    id="acceptTerms"
                    :class="{ 'is-invalid': !acceptTerms && formSubmitted }"
                  />
                  <label class="form-check-label" for="acceptTerms">
                    I agree to the Terms of Service and Privacy Policy *
                  </label>
                  <div v-if="!acceptTerms && formSubmitted" class="invalid-feedback d-block">
                    You must accept the terms and conditions to register
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-success w-100"
                  :disabled="registerLoading || !isRegisterFormValid"
                >
                  <span v-if="registerLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-user-plus me-2"></i>
                  {{ registerLoading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">
              <i class="fas fa-info-circle me-2 text-info"></i>Demo Accounts
            </h6>
            <div class="row">
              <div class="col-sm-6">
                <strong>User:</strong><br />
                <code>user@demo.com</code><br />
                <code>Password123!</code>
              </div>
              <div class="col-sm-6">
                <strong>Admin:</strong><br />
                <code>admin@demo.com</code><br />
                <code>Admin123!</code>
              </div>
            </div>
          </div>
        </div>

        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">
              <i class="fas fa-shield-alt me-2 text-success"></i>Security Features
            </h6>
            <ul class="list-unstyled mb-0 small">
              <li><i class="fas fa-check text-success me-2"></i>XSS Protection</li>
              <li>
                <i class="fas fa-check text-success me-2"></i>Rate limiting for failed attempts
              </li>
              <li><i class="fas fa-check text-success me-2"></i>Strong password requirements</li>
              <li>
                <i class="fas fa-check text-success me-2"></i>Input sanitization and validation
              </li>
              <li><i class="fas fa-check text-success me-2"></i>Security event logging</li>
              <li><i class="fas fa-check text-success me-2"></i>Google OAuth integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../firebase/config.js'
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateName,
  checkRateLimit,
  logSecurityEvent,
} from '../utils/security.js'

const emit = defineEmits(['login-success'])

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)
const formSubmitted = ref(false)
const acceptTerms = ref(false)
const rememberMe = ref(false)
const rateLimitWarning = ref(false)
const rateLimitMessage = ref('')

const loginForm = ref({
  email: '',
  password: '',
})

const loginErrors = ref({
  email: '',
  password: '',
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const registerErrors = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '',
})

const demoUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'user@demo.com',
    password: 'Password123!',
    role: 'user',
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'Admin123!',
    role: 'admin',
  },
]

const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  role: {
    required: true,
    allowedValues: ['user', 'admin'],
  },
}

const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return { score: 0 }

  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 10
  if (/[a-z]/.test(password)) score += 20
  if (/[A-Z]/.test(password)) score += 20
  if (/\d/.test(password)) score += 20
  if (/[@$!%*?&]/.test(password)) score += 15

  const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty']
  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    score -= 30
  }

  if (/(.)\1{2,}/.test(password)) {
    score -= 10
  }

  return { score: Math.max(0, Math.min(100, score)) }
})

const passwordStrengthPercent = computed(() => passwordStrength.value.score)
const passwordStrengthClass = computed(() => {
  const score = passwordStrength.value.score
  if (score < 30) return 'text-danger'
  if (score < 60) return 'text-warning'
  if (score < 90) return 'text-info'
  return 'text-success'
})

const passwordStrengthText = computed(() => {
  const score = passwordStrength.value.score
  if (score < 30) return 'Weak'
  if (score < 60) return 'Fair'
  if (score < 90) return 'Good'
  return 'Strong'
})

const isLoginFormValid = computed(() => {
  return (
    loginForm.value.email &&
    loginForm.value.password &&
    !loginErrors.value.email &&
    !loginErrors.value.password
  )
})

const isRegisterFormValid = computed(() => {
  return (
    registerForm.value.name &&
    registerForm.value.email &&
    registerForm.value.password &&
    registerForm.value.confirmPassword &&
    registerForm.value.role &&
    acceptTerms.value &&
    !Object.values(registerErrors.value).some((error) => error !== '')
  )
})

const validateField = (formType, fieldName, value) => {
  let validationResult

  switch (fieldName) {
    case 'email':
      validationResult = validateEmail(value)
      return validationResult.isValid ? '' : validationResult.error

    case 'password':
      validationResult = validatePassword(value)
      return validationResult.isValid ? '' : validationResult.error

    case 'name':
      validationResult = validateName(value)
      return validationResult.isValid ? '' : validationResult.error

    case 'role':
      if (!value) return 'Please select a role'
      if (!['user', 'admin'].includes(value)) return 'Invalid role selected'
      return ''

    default:
      if (validationRules[fieldName]?.required && !sanitizeInput(value)) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
      }
      return ''
  }
}

const validateRegisterField = (fieldName) => {
  if (fieldName === 'confirmPassword') {
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
      registerErrors.value.confirmPassword = 'Passwords do not match'
    } else {
      registerErrors.value.confirmPassword = ''
    }
  } else {
    registerErrors.value[fieldName] = validateField(
      'register',
      fieldName,
      registerForm.value[fieldName],
    )
  }
}

const validateLoginField = (fieldName) => {
  loginErrors.value[fieldName] = validateField('login', fieldName, loginForm.value[fieldName])
}

const clearLoginError = (fieldName) => {
  loginErrors.value[fieldName] = ''
}

const clearRegisterError = (fieldName) => {
  registerErrors.value[fieldName] = ''
}

const getValidationClass = (formType, fieldName) => {
  const errors = formType === 'login' ? loginErrors.value : registerErrors.value
  const form = formType === 'login' ? loginForm.value : registerForm.value

  if (errors[fieldName]) return 'is-invalid'
  if (form[fieldName] && !errors[fieldName]) return 'is-valid'
  return ''
}

const onPasswordInput = () => {
  clearRegisterError('password')
  if (registerForm.value.confirmPassword) {
    validateRegisterField('confirmPassword')
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  loginErrors.value = { email: '', password: '' }
  registerErrors.value = { name: '', email: '', password: '', confirmPassword: '', role: '' }
  formSubmitted.value = false
  rateLimitWarning.value = false
}

const login = async () => {
  const rateCheck = checkRateLimit('login', 5, 5)
  if (!rateCheck.allowed) {
    rateLimitWarning.value = true
    rateLimitMessage.value = rateCheck.message
    logSecurityEvent('LOGIN_RATE_LIMIT_EXCEEDED', {
      ip: 'client',
      userAgent: navigator.userAgent.substring(0, 100),
    })
    return
  }

  validateLoginField('email')
  validateLoginField('password')

  if (!isLoginFormValid.value) return

  loginLoading.value = true
  loginErrors.value = { email: '', password: '' }

  const emailValidation = validateEmail(loginForm.value.email)
  const passwordValidation = validatePassword(loginForm.value.password)

  if (!emailValidation.isValid || !passwordValidation.isValid) {
    loginErrors.value.email = emailValidation.error || ''
    loginErrors.value.password = passwordValidation.error || ''
    loginLoading.value = false
    return
  }

  const sanitizedEmail = emailValidation.sanitized
  const sanitizedPassword = sanitizeInput(loginForm.value.password)

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const allUsers = [...demoUsers, ...savedUsers]

  const user = allUsers.find((u) => u.email === sanitizedEmail && u.password === sanitizedPassword)

  if (user) {
    logSecurityEvent('LOGIN_SUCCESS', {
      userId: user.id,
      userRole: user.role,
      email: sanitizedEmail,
    })

    const userData = {
      id: user.id,
      name: sanitizeInput(user.name),
      email: sanitizedEmail,
      role: user.role,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem('currentUser', JSON.stringify(userData))

    if (rememberMe.value) {
      localStorage.setItem(
        'rememberUser',
        JSON.stringify({
          email: sanitizedEmail,
          expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
        }),
      )
    }

    emit('login-success', userData)
    showNotification(`Welcome ${sanitizeInput(user.name)}!`, 'success')
  } else {
    logSecurityEvent('LOGIN_FAILED', {
      email: sanitizedEmail,
      timestamp: new Date().toISOString(),
    })

    loginErrors.value.email = 'Invalid email or password'
    loginErrors.value.password = 'Invalid email or password'
    showNotification('Invalid credentials', 'error')
  }

  loginLoading.value = false
}

const loginWithGoogle = async () => {
  try {
    loginLoading.value = true

    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    logSecurityEvent('GOOGLE_LOGIN_SUCCESS', {
      userId: user.uid,
      email: user.email,
      provider: 'google',
    })

    const userData = {
      id: user.uid,
      name: sanitizeInput(user.displayName || 'Google User'),
      email: user.email,
      role: 'user',
      loginTime: new Date().toISOString(),
      provider: 'google',
      photoURL: user.photoURL,
    }

    localStorage.setItem('currentUser', JSON.stringify(userData))

    emit('login-success', userData)
    showNotification(`Welcome ${userData.name}!`, 'success')
  } catch (error) {
    console.error('Google login error:', error)

    logSecurityEvent('GOOGLE_LOGIN_FAILED', {
      error: error.code,
      message: error.message,
    })

    if (error.code === 'auth/popup-closed-by-user') {
      showNotification('Google login cancelled', 'info')
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      showNotification('This email is already registered with a different method', 'error')
    } else {
      showNotification('Google login failed. Please try again.', 'error')
    }
  } finally {
    loginLoading.value = false
  }
}

const register = async () => {
  formSubmitted.value = true

  Object.keys(registerErrors.value).forEach((field) => {
    validateRegisterField(field)
  })

  if (!isRegisterFormValid.value) return

  registerLoading.value = true

  const nameValidation = validateName(registerForm.value.name)
  const emailValidation = validateEmail(registerForm.value.email)
  const passwordValidation = validatePassword(registerForm.value.password)

  if (!nameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
    registerErrors.value.name = nameValidation.error || ''
    registerErrors.value.email = emailValidation.error || ''
    registerErrors.value.password = passwordValidation.error || ''
    registerLoading.value = false
    return
  }

  const sanitizedData = {
    name: nameValidation.sanitized,
    email: emailValidation.sanitized,
    password: sanitizeInput(registerForm.value.password),
    role: registerForm.value.role,
  }

  await new Promise((resolve) => setTimeout(resolve, 1500))

  try {
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const allUsers = [...demoUsers, ...savedUsers]

    if (allUsers.some((user) => user.email === sanitizedData.email)) {
      registerErrors.value.email = 'An account with this email already exists'
      registerLoading.value = false
      return
    }

    const newUser = {
      id: Date.now(),
      ...sanitizedData,
      createdAt: new Date().toISOString(),
    }

    savedUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(savedUsers))

    logSecurityEvent('USER_REGISTRATION', {
      userId: newUser.id,
      email: sanitizedData.email,
      role: sanitizedData.role,
    })

    showNotification(`Account created successfully!`, 'success')

    activeTab.value = 'login'
    registerForm.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    }
    registerErrors.value = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    }
    formSubmitted.value = false
    acceptTerms.value = false
  } catch (error) {
    logSecurityEvent('REGISTRATION_ERROR', {
      error: error.message,
      email: sanitizedData.email,
    })
    showNotification('Registration failed. Please try again.', 'error')
  }

  registerLoading.value = false
}

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} position-fixed`
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  notification.innerHTML = `
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    <div><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>${message}</div>
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 5000)
}

onMounted(() => {
  const rememberedUser = localStorage.getItem('rememberUser')
  if (rememberedUser) {
    try {
      const userData = JSON.parse(rememberedUser)
      if (userData.expires > Date.now()) {
        loginForm.value.email = userData.email
      } else {
        localStorage.removeItem('rememberUser')
      }
    } catch (error) {
      localStorage.removeItem('rememberUser')
    }
  }
})
</script>

<style scoped>
.bg-primary {
  background: linear-gradient(135deg, #e91e63, #ad1457) !important;
}

.nav-tabs .nav-link {
  border: none;
  color: #6c757d;
}

.nav-tabs .nav-link.active {
  background-color: transparent;
  border-bottom: 2px solid #0d6efd;
  color: #0d6efd;
  font-weight: 600;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.form-control:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.is-valid {
  border-color: #198754;
}

.is-invalid {
  border-color: #dc3545;
}

.progress {
  border-radius: 10px;
}

.progress-bar {
  transition: width 0.3s ease-in-out;
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-border-sm {
  animation: spin 0.75s linear infinite;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .card-body {
    padding: 1rem;
  }

  .btn {
    padding: 0.75rem 1rem;
  }
}

.badge {
  font-size: 0.75em;
}

.invalid-feedback {
  font-size: 0.875em;
}

.form-text {
  font-size: 0.875em;
  color: #6c757d;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.alert.position-fixed {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
