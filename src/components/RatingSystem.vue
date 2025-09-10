<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h4><i class="fas fa-star me-2"></i>Rate Our Platform</h4>
          </div>
          <div class="card-body">
            <!-- Overall Rating Display -->
            <div class="text-center mb-4">
              <h2 class="text-primary">{{ averageRating.toFixed(1) }}</h2>
              <div class="rating-stars mb-2">
                <i
                  v-for="n in 5"
                  :key="'display-' + n"
                  :class="[
                    'fas fa-star',
                    {
                      'text-warning': n <= Math.round(averageRating),
                      'text-muted': n > Math.round(averageRating),
                    },
                  ]"
                  style="font-size: 1.5rem; margin: 0 2px"
                ></i>
              </div>
              <p class="text-muted">Average rating from {{ totalRatings }} users</p>
            </div>

            <!-- User Rating Input -->
            <div v-if="!hasUserRated" class="text-center mb-4">
              <h5>How would you rate your experience?</h5>
              <div class="rating-input mb-3">
                <i
                  v-for="n in 5"
                  :key="'input-' + n"
                  :class="[
                    'fas fa-star rating-star',
                    { 'text-warning': n <= currentRating, 'text-muted': n > currentRating },
                  ]"
                  @click="setRating(n)"
                  style="font-size: 2rem; cursor: pointer; margin: 0 5px"
                ></i>
              </div>
              <p class="text-muted">{{ getRatingText(currentRating) }}</p>

              <!-- Comment Input -->
              <div class="mb-3">
                <textarea
                  class="form-control"
                  v-model="comment"
                  placeholder="Tell us about your experience (optional)..."
                  rows="3"
                  maxlength="300"
                ></textarea>
                <small class="text-muted">{{ comment.length }}/300 characters</small>
              </div>

              <button
                class="btn btn-primary"
                @click="submitRating"
                :disabled="currentRating === 0 || isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                <i v-else class="fas fa-paper-plane me-2"></i>
                Submit Rating
              </button>
            </div>

            <!-- Already Rated -->
            <div v-else class="alert alert-success text-center">
              <i class="fas fa-check-circle me-2"></i>
              Thank you! You rated this platform {{ userRating }} star{{
                userRating !== 1 ? 's' : ''
              }}.
            </div>

            <!-- Simple Rating Breakdown -->
            <div class="mt-4">
              <h6>Rating Breakdown</h6>
              <div
                v-for="star in 5"
                :key="'breakdown-' + star"
                class="d-flex align-items-center mb-2"
              >
                <span class="me-2">{{ 6 - star }} star{{ 6 - star !== 1 ? 's' : '' }}</span>
                <div class="progress flex-grow-1 me-2" style="height: 8px">
                  <div
                    class="progress-bar bg-warning"
                    :style="{ width: getStarPercentage(6 - star) + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{ getStarCount(6 - star) }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Comments -->
        <div v-if="recentComments.length > 0" class="card mt-4">
          <div class="card-header">
            <h5>Recent Reviews</h5>
          </div>
          <div class="card-body">
            <div
              v-for="review in recentComments.slice(0, 3)"
              :key="review.id"
              class="border-bottom pb-3 mb-3"
            >
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div class="rating-stars-small">
                    <i
                      v-for="n in 5"
                      :key="'review-' + review.id + '-' + n"
                      :class="[
                        'fas fa-star',
                        { 'text-warning': n <= review.rating, 'text-muted': n > review.rating },
                      ]"
                      style="font-size: 0.9rem"
                    ></i>
                  </div>
                  <strong>{{ review.userName }}</strong>
                </div>
                <small class="text-muted">{{ review.date }}</small>
              </div>
              <p v-if="review.comment" class="mb-0">{{ review.comment }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits(['rating-updated'])

const currentRating = ref(0)
const comment = ref('')
const isSubmitting = ref(false)
const allRatings = ref([])
const userRating = ref(0)

const averageRating = computed(() => {
  if (allRatings.value.length === 0) return 0
  const total = allRatings.value.reduce((sum, rating) => sum + rating.score, 0)
  return total / allRatings.value.length
})

const totalRatings = computed(() => allRatings.value.length)

const hasUserRated = computed(() => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  return allRatings.value.some((rating) => rating.userId === currentUser.id)
})

const recentComments = computed(() => {
  return allRatings.value
    .filter((rating) => rating.comment && rating.comment.trim())
    .sort((a, b) => new Date(b.date) - new Date(a.date))
})

const setRating = (rating) => {
  currentRating.value = rating
}

const getRatingText = (rating) => {
  const texts = {
    0: 'Select a rating',
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  }
  return texts[rating] || ''
}

const submitRating = async () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  if (!currentUser.id) {
    alert('Please log in to submit a rating')
    return
  }

  if (currentRating.value === 0) return

  isSubmitting.value = true
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newRating = {
    id: Date.now(),
    userId: currentUser.id,
    userName: currentUser.name,
    score: currentRating.value,
    comment: comment.value,
    date: new Date().toLocaleDateString(),
  }

  const existingRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
  const filteredRatings = existingRatings.filter((r) => r.userId !== currentUser.id)
  filteredRatings.push(newRating)

  localStorage.setItem('platformRatings', JSON.stringify(filteredRatings))

  userRating.value = currentRating.value
  loadRatings()

  currentRating.value = 0
  comment.value = ''
  isSubmitting.value = false

  emit('rating-updated', newRating)
  showNotification('Thank you for your rating!')
}

const getStarPercentage = (starLevel) => {
  if (totalRatings.value === 0) return 0
  const count = getStarCount(starLevel)
  return (count / totalRatings.value) * 100
}

const getStarCount = (starLevel) => {
  return allRatings.value.filter((rating) => rating.score === starLevel).length
}

const loadRatings = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
  const savedRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

  allRatings.value = savedRatings

  const userRatingObj = savedRatings.find((rating) => rating.userId === currentUser.id)
  if (userRatingObj) {
    userRating.value = userRatingObj.score
  }
}

const showNotification = (message) => {
  const notification = document.createElement('div')
  notification.className = 'alert alert-success position-fixed'
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;'
  notification.innerHTML = `
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    <div><i class="fas fa-check-circle me-2"></i>${message}</div>
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove()
    }
  }, 4000)
}

onMounted(() => {
  loadRatings()
})
</script>

<style scoped>
.rating-star {
  transition: all 0.2s ease;
}

.rating-star:hover {
  transform: scale(1.1);
}

.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.progress {
  border-radius: 10px;
  background-color: #f8f9fa;
}

.progress-bar {
  border-radius: 10px;
}
</style>
