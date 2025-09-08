<template>
  <!-- Welcome Banner -->
  <div class="bg-primary text-white py-3 mb-4">
    <div class="container text-center">
      <h3><i class="fas fa-user-shield me-2"></i>Welcome to WomenCare</h3>
      <p class="mb-0">Join our community or sign in to access personalized health features</p>
    </div>
  </div>

  <div class="container mt-4">
    <!-- Security Info Alert -->
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

    <!-- Login/Register Toggle -->
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
            <!-- Login Form -->
            <div v-if="activeTab === 'login'">
              <h4 class="text-center mb-4">
                <i class="fas fa-lock me-2 text-primary"></i>Secure Login
              </h4>

              <!-- Rate limiting warning -->
              <div v-if="loginAttempts >= 3" class="alert alert-warning mb-3">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Multiple failed attempts detected. Please wait before trying again.
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
                      :disabled="loginAttempts >= 5"
                      autocomplete="email"
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
                      :disabled="loginAttempts >= 5"
                      autocomplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showLoginPassword = !showLoginPassword"
                    >
                      <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div v-if="loginErrors.password" class="invalid-feedback d-block">
                    <i class="fas fa-exclamation-circle me-1"></i>{{ loginErrors.password }}
                  </div>
                </div>

                <!-- Remember Me -->
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
                  :disabled="loginLoading || loginAttempts >= 5 || !isLoginFormValid"
                >
                  <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loginLoading ? 'Signing In...' : 'Login' }}
                </button>

                <!-- Rate limiting countdown -->
                <div v-if="rateLimitCountdown > 0" class="text-center mt-2">
                  <small class="text-warning">
                    <i class="fas fa-clock me-1"></i>
                    Please wait {{ rateLimitCountdown }} seconds before trying again
                  </small>
                </div>
              </form>
            </div>

            <!-- Register Form -->
            <div v-else>
              <h4 class="text-center mb-4">
                <i class="fas fa-user-plus me-2 text-success"></i>Create Account
              </h4>

              <!-- Password Strength Indicator -->
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

                <!-- Terms and Conditions -->
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

        <!-- Demo Accounts Info -->
        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">
              <i class="fas fa-info-circle me-2 text-info"></i>Demo Accounts
            </h6>
            <div class="row">
              <div class="col-sm-6">
                <strong>User:</strong><br />
                <code>user@demo.com</code><br />
                <code>password123</code>
              </div>
              <div class="col-sm-6">
                <strong>Admin:</strong><br />
                <code>admin@demo.com</code><br />
                <code>admin123</code>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Features Info -->
        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">
              <i class="fas fa-shield-alt me-2 text-success"></i>Security Features
            </h6>
            <ul class="list-unstyled mb-0 small">
              <li><i class="fas fa-check text-success me-2"></i>Advanced XSS Protection</li>
              <li>
                <i class="fas fa-check text-success me-2"></i>Rate limiting for failed attempts
              </li>
              <li><i class="fas fa-check text-success me-2"></i>Strong password requirements</li>
              <li>
                <i class="fas fa-check text-success me-2"></i>Input sanitization and validation
              </li>
              <li><i class="fas fa-check text-success me-2"></i>Secure session management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['login-success'])

// UI State
const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)
const showLoginPassword = ref(false)
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)
const formSubmitted = ref(false)
const acceptTerms = ref(false)
const rememberMe = ref(false)

// Security State
const loginAttempts = ref(0)
const rateLimitCountdown = ref(0)
const rateLimitInterval = ref(null)

// Login form
const loginForm = ref({
  email: '',
  password: '',
})

const loginErrors = ref({
  email: '',
  password: '',
})

// Register form
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

// Demo users for authentication
const demoUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'user@demo.com',
    password: 'password123',
    role: 'user',
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
]

// Enhanced XSS Protection function
const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return ''

  return (
    input
      // Remove script tags and dangerous content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/<iframe[^>]*>/gi, '')
      .replace(/<object[^>]*>/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<form[^>]*>/gi, '')
      .replace(/document\.cookie/gi, '')
      .replace(/document\.write/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/window\.location/gi, '')
      // Encode HTML entities
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      // Remove null bytes and control characters
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim()
  )
}

// Enhanced Validation Rules
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
    // Must contain: uppercase, lowercase, number, and special char
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  role: {
    required: true,
    allowedValues: ['user', 'admin'],
  },
}

// Password Strength Calculation
const passwordStrength = computed(() => {
  const password = registerForm.value.password
  if (!password) return { score: 0 }

  let score = 0

  // Length check
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 10

  // Character type checks
  if (/[a-z]/.test(password)) score += 20
  if (/[A-Z]/.test(password)) score += 20
  if (/\d/.test(password)) score += 20
  if (/[@$!%*?&]/.test(password)) score += 15

  // Avoid common passwords
  const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty']
  if (commonPasswords.some((common) => password.toLowerCase().includes(common))) {
    score -= 30
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

// Form Validation
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

// Comprehensive Field Validation
const validateField = (formType, fieldName, value) => {
  const rules = validationRules[fieldName]
  if (!rules) return ''

  const sanitizedValue = sanitizeInput(value)

  if (rules.required && !sanitizedValue) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`
  }

  if (!rules.required && !sanitizedValue) return ''

  if (rules.minLength && sanitizedValue.length < rules.minLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rules.minLength} characters`
  }

  if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
    return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} cannot exceed ${rules.maxLength} characters`
  }

  if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
    switch (fieldName) {
      case 'name':
        return 'Name can only contain letters, spaces, hyphens, and apostrophes'
      case 'email':
        return 'Please enter a valid email address'
      case 'password':
        return 'Password must contain uppercase, lowercase, number, and special character'
      default:
        return `Invalid ${fieldName} format`
    }
  }

  if (rules.allowedValues && !rules.allowedValues.includes(sanitizedValue)) {
    return `Please select a valid ${fieldName}`
  }

  // Check for email uniqueness during registration
  if (formType === 'register' && fieldName === 'email') {
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const emailExists = [...demoUsers, ...existingUsers].some(
      (user) => user.email === sanitizedValue,
    )
    if (emailExists) {
      return 'An account with this email already exists'
    }
  }

  return ''
}

// Enhanced Validation functions
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

// Event Handlers
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
}

// Rate Limiting
const startRateLimit = () => {
  rateLimitCountdown.value = 30
  rateLimitInterval.value = setInterval(() => {
    rateLimitCountdown.value--
    if (rateLimitCountdown.value <= 0) {
      clearInterval(rateLimitInterval.value)
      loginAttempts.value = 0
    }
  }, 1000)
}

// Enhanced Login function
const login = async () => {
  validateLoginField('email')
  validateLoginField('password')

  if (!isLoginFormValid.value || loginAttempts.value >= 5) return

  loginLoading.value = true
  loginErrors.value = { email: '', password: '' }

  // Sanitize inputs for XSS protection
  const sanitizedEmail = sanitizeInput(loginForm.value.email)
  const sanitizedPassword = sanitizeInput(loginForm.value.password)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check against demo users and localStorage users
  const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const allUsers = [...demoUsers, ...savedUsers]

  const user = allUsers.find((u) => u.email === sanitizedEmail && u.password === sanitizedPassword)

  if (user) {
    loginAttempts.value = 0

    // Store current user
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
          expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        }),
      )
    }

    emit('login-success', userData)
    showNotification(`Welcome ${user.name}! You are logged in as ${user.role}.`, 'success')
  } else {
    loginAttempts.value++
    loginErrors.value.email = 'Invalid email or password'
    loginErrors.value.password = 'Invalid email or password'

    if (loginAttempts.value >= 3) {
      startRateLimit()
      showNotification(
        'Multiple failed login attempts. Please wait before trying again.',
        'warning',
      )
    }
  }

  loginLoading.value = false
}

// Enhanced Register function
const register = async () => {
  formSubmitted.value = true

  // Validate all fields
  Object.keys(registerErrors.value).forEach((field) => {
    validateRegisterField(field)
  })

  // Check if any errors exist
  if (!isRegisterFormValid.value) return

  registerLoading.value = true

  // Sanitize inputs for XSS protection
  const sanitizedData = {
    name: sanitizeInput(registerForm.value.name),
    email: sanitizeInput(registerForm.value.email),
    password: sanitizeInput(registerForm.value.password),
    role: registerForm.value.role,
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  try {
    // Save to localStorage
    const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const newUser = {
      id: Date.now(),
      ...sanitizedData,
      createdAt: new Date().toISOString(),
    }

    savedUsers.push(newUser)
    localStorage.setItem('registeredUsers', JSON.stringify(savedUsers))

    showNotification(
      `Account created successfully! You can now login with ${newUser.email}`,
      'success',
    )

    // Switch to login tab and clear form
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
    showNotification('Registration failed. Please try again.', 'error')
  }

  registerLoading.value = false
}

// Notification System
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

// Load remembered user on component mount
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

// Cleanup on component unmount
onUnmounted(() => {
  if (rateLimitInterval.value) {
    clearInterval(rateLimitInterval.value)
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

/* Animation for form transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading spinner animation */
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

/* Responsive improvements */
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

/* Security badge styling */
.badge {
  font-size: 0.75em;
}

/* Form validation feedback */
.invalid-feedback {
  font-size: 0.875em;
}

.form-text {
  font-size: 0.875em;
  color: #6c757d;
}

/* Enhanced button states */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Alert positioning for notifications */
.alert.position-fixed {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
