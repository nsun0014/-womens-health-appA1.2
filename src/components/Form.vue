<template>
  <div class="container mt-4">
    <div class="card mb-3">
      <div class="card-body">
        <h6>Form Completion Progress</h6>
        <div class="progress">
          <div
            class="progress-bar"
            :style="{ width: formProgress + '%' }"
            :class="progressBarClass"
          >
            {{ Math.round(formProgress) }}%
          </div>
        </div>
      </div>
    </div>

    <div class="alert alert-info mb-4">
      <div class="d-flex align-items-center">
        <i class="fas fa-lightbulb me-3" style="font-size: 1.5rem"></i>
        <div>
          <h6 class="mb-1">Daily Health Tip</h6>
          <p class="mb-0">{{ currentHealthTip }}</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Women's Health Profile Form</h2>
        <p class="mb-0">Create your personalized health profile</p>
        <small class="text-muted">Fields marked with * are required</small>
      </div>
      <div class="card-body">
        <form @submit.prevent="submitForm" ref="healthForm">
          <div class="mb-3">
            <label class="form-label">Full Name *</label>
            <input
              type="text"
              class="form-control"
              :class="getFieldClass('name')"
              v-model="formData.name"
              @blur="validateField('name')"
              @input="onNameInput"
              placeholder="Enter your full name"
              maxlength="50"
            />
            <div class="form-text" v-if="!errors.name">
              {{ formData.name.length }}/50 characters
            </div>
            <div v-if="errors.name" class="invalid-feedback">
              {{ errors.name }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Email Address *</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                class="form-control"
                :class="getFieldClass('email')"
                v-model="formData.email"
                @blur="validateField('email')"
                @input="onEmailInput"
                placeholder="Enter your email address"
              />
            </div>
            <div v-if="emailSuggestion" class="form-text text-info">
              Did you mean:
              <button type="button" class="btn btn-link btn-sm p-0" @click="acceptEmailSuggestion">
                {{ emailSuggestion }}</button
              >?
            </div>
            <div v-if="errors.email" class="invalid-feedback">
              {{ errors.email }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Age *</label>
            <input
              type="number"
              class="form-control"
              :class="getFieldClass('age')"
              v-model.number="formData.age"
              @blur="validateField('age')"
              @input="onAgeInput"
              min="13"
              max="100"
              placeholder="Enter your age"
            />
            <div class="form-text" v-if="formData.age && !errors.age">
              {{ getAgeCategory(formData.age) }}
            </div>
            <div v-if="errors.age" class="invalid-feedback">
              {{ errors.age }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Phone Number</label>
            <input
              type="tel"
              class="form-control"
              :class="getFieldClass('phone')"
              v-model="formData.phone"
              @blur="validateField('phone')"
              @input="formatPhone"
              placeholder="Enter your phone number"
            />
            <div v-if="errors.phone" class="invalid-feedback">
              {{ errors.phone }}
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Primary Health Goal</label>
            <select class="form-select" v-model="formData.healthGoal" @change="onHealthGoalChange">
              <option value="">Select your primary health goal</option>
              <option v-for="goal in healthGoalOptions" :key="goal.value" :value="goal.value">
                {{ goal.label }}
              </option>
            </select>
          </div>

          <div v-if="formData.healthGoal === 'fitness'" class="mb-3">
            <label class="form-label">Current Activity Level</label>
            <select class="form-select" v-model="formData.activityLevel">
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little or no exercise)</option>
              <option value="light">Lightly active (light exercise 1-3 days/week)</option>
              <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
              <option value="active">Very active (hard exercise 6-7 days/week)</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Health Notes (Optional)</label>
            <textarea
              class="form-control"
              v-model="formData.notes"
              @input="onNotesInput"
              placeholder="Any specific health concerns or goals..."
              rows="3"
              maxlength="500"
            ></textarea>
            <div class="form-text">{{ formData.notes.length }}/500 characters</div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || isSubmitting">
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ isSubmitting ? 'Saving...' : 'Save Profile' }}
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="resetForm">
              <i class="fas fa-undo me-2"></i>
              Reset Form
            </button>
          </div>

          <div v-if="showSuccessAnimation" class="alert alert-success mt-3 fade-in">
            <div class="d-flex align-items-center">
              <div class="success-icon me-3">
                <i class="fas fa-check-circle"></i>
              </div>
              <div>
                <strong>Success!</strong> Your health profile has been saved securely.
                <br />
                <small>You can view it in the saved profiles section below.</small>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>

    <div v-if="savedProfiles.length > 0" class="card mt-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h4>Saved Profiles ({{ savedProfiles.length }})</h4>
        <div class="btn-group" role="group">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            :class="{ active: profileViewMode === 'grid' }"
            @click="profileViewMode = 'grid'"
          >
            <i class="fas fa-th"></i>
          </button>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            :class="{ active: profileViewMode === 'list' }"
            @click="profileViewMode = 'list'"
          >
            <i class="fas fa-list"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div v-if="profileViewMode === 'grid'" class="row">
          <div
            class="col-md-6 mb-3"
            v-for="(profile, index) in paginatedProfiles"
            :key="profile.id"
          >
            <div class="card border-start border-primary border-3">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <h6 class="card-title">{{ profile.name }}</h6>
                  <button class="btn btn-outline-danger btn-sm" @click="deleteProfile(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
                <p class="card-text small mb-1"><strong>Email:</strong> {{ profile.email }}</p>
                <p class="card-text small mb-1">
                  <strong>Age:</strong> {{ profile.age }} ({{ getAgeCategory(profile.age) }})
                </p>
                <p class="card-text small mb-1" v-if="profile.phone">
                  <strong>Phone:</strong> {{ profile.phone }}
                </p>
                <p class="card-text small mb-2" v-if="profile.healthGoal">
                  <strong>Goal:</strong> {{ getHealthGoalLabel(profile.healthGoal) }}
                </p>
                <p class="card-text small" v-if="profile.notes">
                  <strong>Notes:</strong> {{ profile.notes.substring(0, 100) }}
                  <span v-if="profile.notes.length > 100">...</span>
                </p>
                <small class="text-muted">Saved: {{ profile.savedDate }}</small>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Age</th>
                <th>Goal</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(profile, index) in paginatedProfiles" :key="profile.id">
                <td>{{ profile.name }}</td>
                <td>{{ profile.email }}</td>
                <td>{{ profile.age }}</td>
                <td>{{ getHealthGoalLabel(profile.healthGoal) }}</td>
                <td>{{ profile.savedDate }}</td>
                <td>
                  <button class="btn btn-outline-danger btn-sm" @click="deleteProfile(index)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <nav v-if="savedProfiles.length > profilesPerPage">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="currentPage--">Previous</button>
            </li>
            <li
              class="page-item"
              v-for="page in totalPages"
              :key="page"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="currentPage = page">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="currentPage++">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <div class="card mt-4">
      <div class="card-header">
        <h5><i class="fas fa-chart-bar me-2"></i>Profile Statistics</h5>
      </div>
      <div class="card-body">
        <div class="row text-center">
          <div class="col-md-3 col-6 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <h4>{{ profileStatistics.totalProfiles }}</h4>
                <small>Total Profiles</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <h4>{{ profileStatistics.averageAge }}</h4>
                <small>Average Age</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <h4>{{ profileStatistics.mostCommonGoal }}</h4>
                <small>Top Goal</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <h4>{{ profileStatistics.completionRate }}%</h4>
                <small>Form Completion</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const healthTips = ref([
  'Stay hydrated by drinking at least 8 glasses of water daily.',
  'Take a 10-minute walk after meals to aid digestion.',
  'Practice deep breathing exercises to reduce stress levels.',
  'Aim for 7-9 hours of quality sleep each night.',
  'Include colorful fruits and vegetables in every meal.',
  'Schedule regular health check-ups with your healthcare provider.',
])

const currentHealthTip = ref(healthTips.value[0])
const showSuccessAnimation = ref(false)

const formData = ref({
  name: '',
  email: '',
  age: null,
  phone: '',
  healthGoal: '',
  activityLevel: '',
  notes: '',
})

const errors = ref({
  name: '',
  email: '',
  age: '',
  phone: '',
})

const savedProfiles = ref([])
const isSubmitting = ref(false)
const profileViewMode = ref('grid')
const currentPage = ref(1)
const profilesPerPage = 4
const emailSuggestion = ref('')
const healthForm = ref(null)

const healthGoalOptions = ref([
  { value: 'reproductive', label: 'Reproductive Health' },
  { value: 'mental', label: 'Mental Health & Wellness' },
  { value: 'fitness', label: 'Fitness & Exercise' },
  { value: 'nutrition', label: 'Nutrition & Diet' },
  { value: 'general', label: 'General Health Maintenance' },
  { value: 'preventive', label: 'Preventive Care' },
])

const formProgress = computed(() => {
  const fields = ['name', 'email', 'age']
  const optionalFields = ['phone', 'healthGoal', 'notes']

  let completed = 0
  let total = fields.length + optionalFields.length

  fields.forEach((field) => {
    if (formData.value[field] && !errors.value[field]) {
      completed += 2
    }
  })

  optionalFields.forEach((field) => {
    if (formData.value[field]) {
      completed += 1
    }
  })

  return Math.min((completed / (fields.length * 2 + optionalFields.length)) * 100, 100)
})

const progressBarClass = computed(() => {
  if (formProgress.value < 30) return 'bg-danger'
  if (formProgress.value < 70) return 'bg-warning'
  return 'bg-success'
})

const isFormValid = computed(() => {
  return (
    formData.value.name &&
    formData.value.email &&
    formData.value.age &&
    !errors.value.name &&
    !errors.value.email &&
    !errors.value.age &&
    !errors.value.phone
  )
})

const paginatedProfiles = computed(() => {
  const start = (currentPage.value - 1) * profilesPerPage
  const end = start + profilesPerPage
  return savedProfiles.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(savedProfiles.value.length / profilesPerPage)
})

const profileStatistics = computed(() => {
  if (savedProfiles.value.length === 0) {
    return {
      totalProfiles: 0,
      averageAge: 0,
      mostCommonGoal: 'N/A',
      completionRate: 0,
    }
  }

  const totalProfiles = savedProfiles.value.length
  const ages = savedProfiles.value.map((p) => p.age).filter((age) => age)
  const averageAge = ages.length ? Math.round(ages.reduce((a, b) => a + b) / ages.length) : 0

  const goalCounts = {}
  savedProfiles.value.forEach((profile) => {
    if (profile.healthGoal) {
      goalCounts[profile.healthGoal] = (goalCounts[profile.healthGoal] || 0) + 1
    }
  })

  const mostCommonGoal = Object.keys(goalCounts).length
    ? Object.keys(goalCounts).reduce((a, b) => (goalCounts[a] > goalCounts[b] ? a : b))
    : 'N/A'

  const completeProfiles = savedProfiles.value.filter(
    (p) => p.name && p.email && p.age && p.phone && p.healthGoal && p.notes,
  ).length
  const completionRate = Math.round((completeProfiles / totalProfiles) * 100)

  return {
    totalProfiles,
    averageAge,
    mostCommonGoal: getHealthGoalLabel(mostCommonGoal),
    completionRate,
  }
})

const validationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: {
      required: 'Full name is required',
      minLength: 'Name must be at least 2 characters',
      maxLength: 'Name cannot exceed 50 characters',
      pattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 100,
    message: {
      required: 'Email address is required',
      pattern: 'Please enter a valid email address',
      maxLength: 'Email address is too long',
    },
  },
  age: {
    required: true,
    min: 13,
    max: 100,
    message: {
      required: 'Age is required',
      min: 'Age must be at least 13 years',
      max: 'Please enter a valid age (maximum 100)',
    },
  },
  phone: {
    required: false,
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message: {
      pattern: 'Please enter a valid phone number',
    },
  },
}

const validateField = (fieldName) => {
  const value = formData.value[fieldName]
  const rules = validationRules[fieldName]

  if (!rules) return

  errors.value[fieldName] = ''

  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    errors.value[fieldName] = rules.message.required
    return
  }

  if (!rules.required && !value) return

  if (rules.pattern && !rules.pattern.test(value)) {
    errors.value[fieldName] = rules.message.pattern
    return
  }

  if (rules.minLength && value.length < rules.minLength) {
    errors.value[fieldName] = rules.message.minLength
    return
  }

  if (rules.maxLength && value.length > rules.maxLength) {
    errors.value[fieldName] = rules.message.maxLength
    return
  }

  if (rules.min && value < rules.min) {
    errors.value[fieldName] = rules.message.min
    return
  }

  if (rules.max && value > rules.max) {
    errors.value[fieldName] = rules.message.max
    return
  }
}

const getFieldClass = (fieldName) => {
  if (errors.value[fieldName]) return 'is-invalid'
  if (formData.value[fieldName] && !errors.value[fieldName]) return 'is-valid'
  return ''
}

const getAgeCategory = (age) => {
  if (age < 18) return 'Adolescent'
  if (age < 30) return 'Young Adult'
  if (age < 50) return 'Adult'
  if (age < 65) return 'Middle-aged'
  return 'Senior'
}

const getHealthGoalLabel = (value) => {
  const option = healthGoalOptions.value.find((opt) => opt.value === value)
  return option ? option.label : value
}

const onNameInput = () => {
  if (formData.value.name.length >= 2) {
    validateField('name')
  }
}

const onEmailInput = () => {
  const email = formData.value.email.toLowerCase()
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']

  if (email.includes('@') && !email.includes('.')) {
    const parts = email.split('@')
    if (parts[1]) {
      const suggested = commonDomains.find(
        (domain) =>
          domain.startsWith(parts[1]) || (parts[1].length > 2 && domain.includes(parts[1])),
      )
      if (suggested) {
        emailSuggestion.value = parts[0] + '@' + suggested
      }
    }
  } else {
    emailSuggestion.value = ''
  }

  if (formData.value.email.includes('@')) {
    validateField('email')
  }
}

const onAgeInput = () => {
  if (formData.value.age) {
    validateField('age')
  }
}

const onNotesInput = () => {}

const formatPhone = () => {
  let phone = formData.value.phone.replace(/\D/g, '')
  if (phone.length >= 10) {
    validateField('phone')
  }
}

const acceptEmailSuggestion = () => {
  formData.value.email = emailSuggestion.value
  emailSuggestion.value = ''
  validateField('email')
}

const onHealthGoalChange = () => {
  if (formData.value.healthGoal !== 'fitness') {
    formData.value.activityLevel = ''
  }
}

const submitForm = async () => {
  Object.keys(validationRules).forEach((field) => {
    validateField(field)
  })

  if (!isFormValid.value) return

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newProfile = {
    ...formData.value,
    id: Date.now() + Math.random(),
    savedDate: new Date().toLocaleDateString(),
    savedTime: new Date().toLocaleTimeString(),
  }

  savedProfiles.value.unshift(newProfile)
  localStorage.setItem('healthProfiles', JSON.stringify(savedProfiles.value))

  resetForm()
  isSubmitting.value = false

  showSuccessAnimation.value = true
  setTimeout(() => {
    showSuccessAnimation.value = false
  }, 4000)

  await nextTick()
  if (savedProfiles.value.length === 1) {
    document.querySelector('.card:nth-child(3)').scrollIntoView({ behavior: 'smooth' })
  }
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    age: null,
    phone: '',
    healthGoal: '',
    activityLevel: '',
    notes: '',
  }

  Object.keys(errors.value).forEach((key) => {
    errors.value[key] = ''
  })

  emailSuggestion.value = ''
}

const deleteProfile = (index) => {
  if (confirm('Are you sure you want to delete this profile?')) {
    const actualIndex = (currentPage.value - 1) * profilesPerPage + index
    savedProfiles.value.splice(actualIndex, 1)
    localStorage.setItem('healthProfiles', JSON.stringify(savedProfiles.value))

    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  }
}

watch(
  () => formData.value.name,
  (newName) => {
    if (newName && newName.length >= 2) {
      validateField('name')
    }
  },
)

onMounted(() => {
  const savedData = localStorage.getItem('healthProfiles')
  if (savedData) {
    try {
      savedProfiles.value = JSON.parse(savedData)
    } catch (e) {
      console.error('Error loading saved profiles:', e)
      localStorage.removeItem('healthProfiles')
    }
  }

  const randomIndex = Math.floor(Math.random() * healthTips.value.length)
  currentHealthTip.value = healthTips.value[randomIndex]
})
</script>

<style scoped>
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.progress {
  height: 8px;
  border-radius: 10px;
}

.progress-bar {
  transition: width 0.3s ease;
}

.is-invalid {
  border-color: #dc3545;
}

.is-valid {
  border-color: #28a745;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  background-color: #f8f9fa;
}

.btn-group .btn.active {
  background-color: #0d6efd;
  color: white;
}

.success-icon {
  font-size: 2rem;
  color: #28a745;
  animation: bounce 0.6s ease-in-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }

  .btn {
    margin-bottom: 0.5rem;
  }

  .col-6 {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 0.5rem;
  }

  .card {
    margin-bottom: 1rem;
  }
}
</style>
