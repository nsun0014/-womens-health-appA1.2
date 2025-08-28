<template>
  <template>
  <!-- Welcome Banner -->
  <div class="bg-primary text-white py-3 mb-4">
    <div class="container text-center">
      <h3><i class="fas fa-user-shield me-2"></i>Welcome to WomenCare</h3>
      <p class="mb-0">Join our community or sign in to access personalized health features</p>
    </div>
  </div>

  <div class="container mt-4">

  <div class="container mt-4">
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
                  @click="activeTab = 'login'"
                >
                  Login
                </button>
              </li>
              <li class="nav-item">
                <button
                  class="nav-link"
                  :class="{ active: activeTab === 'register' }"
                  @click="activeTab = 'register'"
                >
                  Register
                </button>
              </li>
            </ul>
          </div>
          <div class="card-body">
            <!-- Login Form -->
            <div v-if="activeTab === 'login'">
              <h4 class="text-center mb-4">Login</h4>
              <form @submit.prevent="login">
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': loginErrors.email }"
                    v-model="loginForm.email"
                    required
                  />
                  <div v-if="loginErrors.email" class="invalid-feedback">
                    {{ loginErrors.email }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': loginErrors.password }"
                    v-model="loginForm.password"
                    required
                  />
                  <div v-if="loginErrors.password" class="invalid-feedback">
                    {{ loginErrors.password }}
                  </div>
                </div>
                <button type="submit" class="btn btn-primary w-100" :disabled="loginLoading">
                  <span v-if="loginLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Login
                </button>
              </form>
            </div>

            <!-- Register Form -->
            <div v-else>
              <h4 class="text-center mb-4">Create Account</h4>
              <form @submit.prevent="register">
                <div class="mb-3">
                  <label class="form-label">Full Name</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': registerErrors.name }"
                    v-model="registerForm.name"
                    @blur="validateRegisterField('name')"
                    required
                  />
                  <div v-if="registerErrors.name" class="invalid-feedback">
                    {{ registerErrors.name }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': registerErrors.email }"
                    v-model="registerForm.email"
                    @blur="validateRegisterField('email')"
                    required
                  />
                  <div v-if="registerErrors.email" class="invalid-feedback">
                    {{ registerErrors.email }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': registerErrors.password }"
                    v-model="registerForm.password"
                    @blur="validateRegisterField('password')"
                    required
                  />
                  <div v-if="registerErrors.password" class="invalid-feedback">
                    {{ registerErrors.password }}
                  </div>
                  <div class="form-text">Password must be at least 6 characters long</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Confirm Password</label>
                  <input
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': registerErrors.confirmPassword }"
                    v-model="registerForm.confirmPassword"
                    @blur="validateRegisterField('confirmPassword')"
                    required
                  />
                  <div v-if="registerErrors.confirmPassword" class="invalid-feedback">
                    {{ registerErrors.confirmPassword }}
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Role</label>
                  <select class="form-select" v-model="registerForm.role" required>
                    <option value="">Select your role</option>
                    <option value="user">User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-success w-100" :disabled="registerLoading">
                  <span v-if="registerLoading" class="spinner-border spinner-border-sm me-2"></span>
                  Create Account
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Demo Accounts Info -->
        <div class="card mt-3">
          <div class="card-body">
            <h6 class="card-title">Demo Accounts</h6>
            <small class="text-muted">
              <strong>User:</strong> user@demo.com / password123<br />
              <strong>Admin:</strong> admin@demo.com / admin123
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login-success'])

const activeTab = ref('login')
const loginLoading = ref(false)
const registerLoading = ref(false)

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

// Validation functions
const validateRegisterField = (fieldName) => {
  switch (fieldName) {
    case 'name':
      if (!registerForm.value.name || registerForm.value.name.length < 2) {
        registerErrors.value.name = 'Name must be at least 2 characters'
      } else {
        registerErrors.value.name = ''
      }
      break
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(registerForm.value.email)) {
        registerErrors.value.email = 'Please enter a valid email'
      } else {
        registerErrors.value.email = ''
      }
      break
    case 'password':
      if (registerForm.value.password.length < 6) {
        registerErrors.value.password = 'Password must be at least 6 characters'
      } else {
        registerErrors.value.password = ''
      }
      break
    case 'confirmPassword':
      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        registerErrors.value.confirmPassword = 'Passwords do not match'
      } else {
        registerErrors.value.confirmPassword = ''
      }
      break
  }
}

// XSS Protection function
const sanitizeInput = (input) => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
}

// Login function
const login = async () => {
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
    // Store current user
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    )

    emit('login-success', user)
    alert(`Welcome ${user.name}! You are logged in as ${user.role}.`)
  } else {
    loginErrors.value.email = 'Invalid email or password'
    loginErrors.value.password = 'Invalid email or password'
  }

  loginLoading.value = false
}

// Register function
const register = async () => {
  // Validate all fields
  Object.keys(registerErrors.value).forEach((field) => {
    validateRegisterField(field)
  })

  // Check if any errors exist
  const hasErrors = Object.values(registerErrors.value).some((error) => error !== '')
  if (hasErrors) return

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

  // Save to localStorage
  const savedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const newUser = {
    id: Date.now(),
    ...sanitizedData,
    createdAt: new Date().toISOString(),
  }

  savedUsers.push(newUser)
  localStorage.setItem('registeredUsers', JSON.stringify(savedUsers))

  alert(`Account created successfully! You can now login with ${newUser.email}`)

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
  }

  registerLoading.value = false
}
</script>

<style scoped>
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
}
</style>
