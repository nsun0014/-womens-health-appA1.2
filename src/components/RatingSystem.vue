<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-10">
        <!-- Enhanced Header with Overall Stats -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-gradient-primary text-white">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <h4 class="mb-0">
                  <i class="fas fa-star-half-alt me-2"></i>Women's Health Platform Rating
                </h4>
                <p class="mb-0 opacity-75">
                  Help us improve by rating different aspects of our platform
                </p>
              </div>
              <div class="text-end">
                <div class="display-6 fw-bold">{{ overallRating.toFixed(1) }}</div>
                <div class="rating-stars">
                  <i
                    v-for="n in 5"
                    :key="'header-' + n"
                    :class="[
                      'fas fa-star',
                      {
                        'text-warning': n <= Math.round(overallRating),
                        'text-light opacity-50': n > Math.round(overallRating),
                      },
                    ]"
                  ></i>
                </div>
                <small class="opacity-75">{{ totalRatings }} reviews</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Category-based Rating System -->
        <div class="row">
          <div v-for="category in ratingCategories" :key="category.id" class="col-lg-6 mb-4">
            <div class="card h-100 rating-category-card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <h5 class="card-title mb-2">
                      <i :class="category.icon + ' me-2 text-primary'"></i>
                      {{ category.name }}
                    </h5>
                    <p class="text-muted small mb-2">{{ category.description }}</p>

                    <!-- Current Category Rating Display -->
                    <div class="d-flex align-items-center mb-2">
                      <div class="rating-stars me-2">
                        <i
                          v-for="n in 5"
                          :key="'display-' + category.id + '-' + n"
                          :class="[
                            'fas fa-star',
                            {
                              'text-warning': n <= Math.round(category.averageRating),
                              'text-muted': n > Math.round(category.averageRating),
                            },
                          ]"
                        ></i>
                      </div>
                      <span class="fw-bold text-primary">{{
                        category.averageRating.toFixed(1)
                      }}</span>
                      <span class="text-muted ms-1">({{ category.totalRatings }})</span>
                    </div>

                    <!-- Rating Distribution Bar -->
                    <div class="progress mb-3" style="height: 6px">
                      <div
                        class="progress-bar bg-warning"
                        :style="{ width: (category.averageRating / 5) * 100 + '%' }"
                      ></div>
                    </div>
                  </div>
                </div>

                <!-- User Rating Input -->
                <div v-if="!userRatings[category.id]" class="user-rating-section">
                  <label class="form-label small fw-semibold">Your Rating:</label>
                  <div class="rating-input mb-3">
                    <i
                      v-for="n in 5"
                      :key="'input-' + category.id + '-' + n"
                      :class="[
                        'fas fa-star rating-star-interactive',
                        {
                          'text-warning':
                            n <= (hoverRatings[category.id] || tempRatings[category.id] || 0),
                          'text-muted':
                            n > (hoverRatings[category.id] || tempRatings[category.id] || 0),
                        },
                      ]"
                      @click="setRating(category.id, n)"
                      @mouseover="hoverRatings[category.id] = n"
                      @mouseleave="hoverRatings[category.id] = 0"
                    ></i>
                  </div>

                  <div v-if="tempRatings[category.id]" class="mb-3">
                    <textarea
                      class="form-control form-control-sm"
                      v-model="categoryComments[category.id]"
                      :placeholder="
                        'Tell us about your experience with ' + category.name.toLowerCase() + '...'
                      "
                      rows="2"
                      maxlength="200"
                    ></textarea>
                    <small class="text-muted"
                      >{{ (categoryComments[category.id] || '').length }}/200 characters</small
                    >
                  </div>

                  <button
                    v-if="tempRatings[category.id]"
                    class="btn btn-primary btn-sm"
                    @click="submitCategoryRating(category)"
                    :disabled="isSubmitting"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                    Submit Rating
                  </button>
                </div>

                <!-- Already Rated Display -->
                <div v-else class="user-rated-section">
                  <div class="alert alert-success py-2 mb-0">
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <i class="fas fa-check-circle me-1"></i>
                        <small
                          >You rated this {{ userRatings[category.id] }} star{{
                            userRatings[category.id] !== 1 ? 's' : ''
                          }}</small
                        >
                      </div>
                      <button
                        class="btn btn-outline-primary btn-xs"
                        @click="editRating(category.id)"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Overall Platform Experience -->
        <div v-if="!hasOverallRating" class="card mt-4">
          <div class="card-body text-center">
            <h5 class="mb-3">Overall Platform Experience</h5>
            <p class="text-muted mb-3">
              Based on your category ratings, how would you rate your overall experience?
            </p>

            <div class="rating-input-large mb-3">
              <i
                v-for="n in 5"
                :key="'overall-' + n"
                :class="[
                  'fas fa-star rating-star-large',
                  { 'text-warning': n <= overallTempRating, 'text-muted': n > overallTempRating },
                ]"
                @click="overallTempRating = n"
              ></i>
            </div>

            <div class="mb-3">
              <textarea
                class="form-control"
                v-model="overallComment"
                placeholder="Share your overall thoughts about the platform..."
                rows="3"
                maxlength="500"
              ></textarea>
              <small class="text-muted">{{ overallComment.length }}/500 characters</small>
            </div>

            <button
              v-if="overallTempRating"
              class="btn btn-success"
              @click="submitOverallRating"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
              Submit Overall Rating
            </button>
          </div>
        </div>

        <!-- Rating Analytics Dashboard -->
        <div class="card mt-4">
          <div class="card-header">
            <h5><i class="fas fa-chart-bar me-2"></i>Rating Analytics</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <!-- Rating Trends -->
              <div class="col-md-6">
                <h6>Rating Distribution</h6>
                <div
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="'dist-' + star"
                  class="d-flex align-items-center mb-2"
                >
                  <span class="me-2 text-nowrap">{{ star }} star{{ star !== 1 ? 's' : '' }}</span>
                  <div class="progress flex-grow-1 me-2" style="height: 8px">
                    <div
                      class="progress-bar"
                      :class="getProgressBarClass(star)"
                      :style="{ width: getStarPercentage(star) + '%' }"
                    ></div>
                  </div>
                  <small class="text-muted text-nowrap"
                    >{{ getStarCount(star) }} ({{ getStarPercentage(star).toFixed(0) }}%)</small
                  >
                </div>
              </div>

              <!-- Category Performance -->
              <div class="col-md-6">
                <h6>Category Performance</h6>
                <div
                  v-for="category in sortedCategories"
                  :key="'perf-' + category.id"
                  class="d-flex align-items-center mb-2"
                >
                  <i :class="category.icon + ' me-2 text-primary'"></i>
                  <span class="flex-grow-1">{{ category.name }}</span>
                  <div class="rating-stars-small me-2">
                    <i
                      v-for="n in Math.round(category.averageRating)"
                      :key="'perf-star-' + category.id + '-' + n"
                      class="fas fa-star text-warning"
                      style="font-size: 0.7rem"
                    ></i>
                  </div>
                  <span class="text-muted small">{{ category.averageRating.toFixed(1) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Reviews -->
        <div v-if="recentReviews.length > 0" class="card mt-4">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5><i class="fas fa-comments me-2"></i>Recent Reviews</h5>
            <span class="badge bg-primary">{{ recentReviews.length }} reviews</span>
          </div>
          <div class="card-body">
            <div class="row">
              <div
                v-for="review in recentReviews.slice(0, 6)"
                :key="review.id"
                class="col-md-6 mb-3"
              >
                <div class="card border-light review-card">
                  <div class="card-body py-3">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div class="rating-stars-small">
                        <i
                          v-for="n in 5"
                          :key="'review-' + review.id + '-' + n"
                          :class="[
                            'fas fa-star',
                            { 'text-warning': n <= review.rating, 'text-muted': n > review.rating },
                          ]"
                          style="font-size: 0.8rem"
                        ></i>
                      </div>
                      <small class="text-muted">{{ review.date }}</small>
                    </div>
                    <h6 class="mb-1 text-primary">{{ review.category }}</h6>
                    <p v-if="review.comment" class="small mb-2 text-muted">
                      "{{ truncateText(review.comment, 80) }}"
                    </p>
                    <small class="text-muted">- {{ review.userName }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const emit = defineEmits(['rating-updated'])

// Rating Categories for Women's Health Platform
const ratingCategories = ref([
  {
    id: 'health_info',
    name: 'Health Information',
    description: 'Quality and accuracy of health content and resources',
    icon: 'fas fa-heartbeat',
    averageRating: 0,
    totalRatings: 0,
  },
  {
    id: 'user_experience',
    name: 'User Experience',
    description: 'Ease of navigation and overall platform usability',
    icon: 'fas fa-mouse-pointer',
    averageRating: 0,
    totalRatings: 0,
  },
  {
    id: 'community',
    name: 'Community Support',
    description: 'Quality of community interactions and support',
    icon: 'fas fa-users',
    averageRating: 0,
    totalRatings: 0,
  },
  {
    id: 'features',
    name: 'Platform Features',
    description: 'Usefulness and functionality of platform features',
    icon: 'fas fa-cogs',
    averageRating: 0,
    totalRatings: 0,
  },
])

// Reactive data
const tempRatings = ref({})
const hoverRatings = ref({})
const userRatings = ref({})
const categoryComments = ref({})
const overallTempRating = ref(0)
const overallComment = ref('')
const isSubmitting = ref(false)
const allRatings = ref([])
const recentReviews = ref([])

// Computed properties
const overallRating = computed(() => {
  const categoryRatings = ratingCategories.value.filter((cat) => cat.totalRatings > 0)
  if (categoryRatings.length === 0) return 0

  const total = categoryRatings.reduce((sum, cat) => sum + cat.averageRating, 0)
  return total / categoryRatings.length
})

const totalRatings = computed(() => {
  return ratingCategories.value.reduce((sum, cat) => sum + cat.totalRatings, 0)
})

const hasOverallRating = computed(() => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  return allRatings.value.some(
    (rating) => rating.userId === currentUser.id && rating.type === 'overall',
  )
})

const sortedCategories = computed(() => {
  return [...ratingCategories.value].sort((a, b) => b.averageRating - a.averageRating)
})

// Methods
const setRating = (categoryId, rating) => {
  tempRatings.value[categoryId] = rating
}

const editRating = (categoryId) => {
  userRatings.value[categoryId] = null
  tempRatings.value[categoryId] = 0
  categoryComments.value[categoryId] = ''
}

const submitCategoryRating = async (category) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (!currentUser.id) {
    showNotification('Please log in to submit a rating', 'warning')
    return
  }

  const rating = tempRatings.value[category.id]
  if (!rating) return

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 800))

  const newRating = {
    id: Date.now() + Math.random(),
    userId: currentUser.id,
    userName: currentUser.name,
    categoryId: category.id,
    categoryName: category.name,
    rating: rating,
    comment: categoryComments.value[category.id] || '',
    type: 'category',
    date: new Date().toLocaleDateString(),
    timestamp: new Date().toISOString(),
  }

  // Save to localStorage
  const existingRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

  // Remove existing rating for this category from this user
  const filteredRatings = existingRatings.filter(
    (r) => !(r.userId === currentUser.id && r.categoryId === category.id),
  )

  filteredRatings.push(newRating)
  localStorage.setItem('platformRatings', JSON.stringify(filteredRatings))

  // Update local state
  userRatings.value[category.id] = rating
  tempRatings.value[category.id] = 0
  categoryComments.value[category.id] = ''

  loadRatingData()
  isSubmitting.value = false

  showNotification(`Thank you for rating ${category.name}!`, 'success')
  emit('rating-updated', newRating)
}

const submitOverallRating = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (!currentUser.id || !overallTempRating.value) return

  isSubmitting.value = true

  await new Promise((resolve) => setTimeout(resolve, 800))

  const newRating = {
    id: Date.now() + Math.random(),
    userId: currentUser.id,
    userName: currentUser.name,
    score: overallTempRating.value,
    comment: overallComment.value,
    type: 'overall',
    date: new Date().toLocaleDateString(),
    timestamp: new Date().toISOString(),
  }

  const existingRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

  // Remove existing overall rating from this user
  const filteredRatings = existingRatings.filter(
    (r) => !(r.userId === currentUser.id && r.type === 'overall'),
  )

  filteredRatings.push(newRating)
  localStorage.setItem('platformRatings', JSON.stringify(filteredRatings))

  // Reset form
  overallTempRating.value = 0
  overallComment.value = ''

  loadRatingData()
  isSubmitting.value = false

  showNotification('Thank you for your overall rating!', 'success')
  emit('rating-updated', newRating)
}

const getStarPercentage = (starLevel) => {
  const allCategoryRatings = allRatings.value.filter((r) => r.type === 'category')
  if (allCategoryRatings.length === 0) return 0

  const count = allCategoryRatings.filter((r) => r.rating === starLevel).length
  return (count / allCategoryRatings.length) * 100
}

const getStarCount = (starLevel) => {
  return allRatings.value.filter((r) => r.type === 'category' && r.rating === starLevel).length
}

const getProgressBarClass = (starLevel) => {
  if (starLevel >= 4) return 'bg-success'
  if (starLevel >= 3) return 'bg-warning'
  return 'bg-danger'
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const loadRatingData = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const savedRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

  allRatings.value = savedRatings

  // Load user's existing ratings
  userRatings.value = {}
  savedRatings.forEach((rating) => {
    if (rating.userId === currentUser.id && rating.categoryId) {
      userRatings.value[rating.categoryId] = rating.rating
    }
  })

  // Calculate category averages
  ratingCategories.value.forEach((category) => {
    const categoryRatings = savedRatings.filter((r) => r.categoryId === category.id)
    if (categoryRatings.length > 0) {
      const total = categoryRatings.reduce((sum, r) => sum + r.rating, 0)
      category.averageRating = total / categoryRatings.length
      category.totalRatings = categoryRatings.length
    } else {
      category.averageRating = 0
      category.totalRatings = 0
    }
  })

  // Load recent reviews
  recentReviews.value = savedRatings
    .filter((r) => r.comment && r.comment.trim())
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .map((r) => ({
      id: r.id,
      rating: r.rating || r.score,
      comment: r.comment,
      category: r.categoryName || 'Overall Experience',
      userName: r.userName,
      date: r.date,
    }))
}

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div')
  notification.className = `alert alert-${type} position-fixed`
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  notification.innerHTML = `
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    <div><i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>${message}</div>
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 4000)
}

// Lifecycle
onMounted(() => {
  loadRatingData()
})

watch(
  () => localStorage.getItem('platformRatings'),
  () => loadRatingData(),
)
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #e91e63, #ad1457) !important;
}

.rating-star-interactive {
  font-size: 1.5rem;
  cursor: pointer;
  margin: 0 3px;
  transition: all 0.2s ease;
}

.rating-star-interactive:hover {
  transform: scale(1.2);
  filter: drop-shadow(0 0 5px rgba(255, 193, 7, 0.6));
}

.rating-star-large {
  font-size: 2.5rem;
  cursor: pointer;
  margin: 0 8px;
  transition: all 0.3s ease;
}

.rating-star-large:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.5));
}

.rating-category-card {
  transition: all 0.3s ease;
  border: 1px solid #e3e6f0;
}

.rating-category-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #4e73df;
}

.review-card {
  transition: transform 0.2s ease;
}

.review-card:hover {
  transform: translateY(-2px);
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.progress {
  border-radius: 10px;
  background-color: #f8f9fa;
}

.progress-bar {
  border-radius: 10px;
  transition: width 0.5s ease;
}

@media (max-width: 768px) {
  .rating-star-large {
    font-size: 2rem;
    margin: 0 5px;
  }

  .rating-star-interactive {
    font-size: 1.3rem;
    margin: 0 2px;
  }
}
</style>
