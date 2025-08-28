<template>
  <div id="app">
    <!-- Navigation Bar with Authentication -->
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" href="#"> <i class="fas fa-heart me-2"></i>WomenCare </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'dashboard' }"
                href="#"
                @click="currentPage = 'dashboard'"
              >
                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'profile' }"
                href="#"
                @click="currentPage = 'profile'"
              >
                <i class="fas fa-user me-1"></i>Health Profile
              </a>
            </li>
            <li class="nav-item" v-if="currentUser && currentUser.role === 'admin'">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'admin' }"
                href="#"
                @click="currentPage = 'admin'"
              >
                <i class="fas fa-cog me-1"></i>Admin Panel
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'rating' }"
                href="#"
                @click="currentPage = 'rating'"
              >
                <i class="fas fa-star me-1"></i>Rate Platform
              </a>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item" v-if="!currentUser">
              <a class="nav-link" href="#" @click="currentPage = 'auth'">
                <i class="fas fa-sign-in-alt me-1"></i>Login / Register
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <span class="nav-link">
                <i class="fas fa-user-circle me-1"></i>
                {{ currentUser.name }}
                <span class="badge bg-light text-dark ms-1">{{ currentUser.role }}</span>
              </span>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a class="nav-link" href="#" @click="logout">
                <i class="fas fa-sign-out-alt me-1"></i>Logout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <!-- Authentication Page -->
      <AuthSystem
        v-if="currentPage === 'auth' && !currentUser"
        @login-success="handleLoginSuccess"
      />

      <!-- Dashboard -->
      <div v-if="currentPage === 'dashboard' && currentUser" class="container mt-4">
        <div class="row">
          <div class="col-12">
            <h2>Welcome to Your Dashboard, {{ currentUser.name }}!</h2>
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              You are logged in as: <strong>{{ currentUser.role }}</strong>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="row">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body text-center">
                <i class="fas fa-users fa-2x mb-2"></i>
                <h4>{{ platformStats.totalUsers }}</h4>
                <small>Total Users</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body text-center">
                <i class="fas fa-file-medical fa-2x mb-2"></i>
                <h4>{{ platformStats.healthProfiles }}</h4>
                <small>Health Profiles</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body text-center">
                <i class="fas fa-star fa-2x mb-2"></i>
                <h4>{{ platformStats.averageRating.toFixed(1) }}</h4>
                <small>Average Rating</small>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body text-center">
                <i class="fas fa-chart-line fa-2x mb-2"></i>
                <h4>{{ platformStats.totalRatings }}</h4>
                <small>Total Ratings</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Health Profile Form -->
      <Form v-if="currentPage === 'profile' && currentUser" />

      <!-- Admin Panel -->
      <div
        v-if="currentPage === 'admin' && currentUser && currentUser.role === 'admin'"
        class="container mt-4"
      >
        <h2><i class="fas fa-cog me-2"></i>Admin Panel</h2>

        <div class="card mb-4">
          <div class="card-header">
            <h5>User Management</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in allUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span
                        class="badge"
                        :class="user.role === 'admin' ? 'bg-danger' : 'bg-primary'"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.createdAt || '2024-01-01') }}</td>
                    <td>
                      <button class="btn btn-sm btn-outline-secondary" disabled>
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5>Platform Ratings Overview</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Rating Distribution</h6>
                <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="mb-2">
                  <div class="d-flex align-items-center">
                    <span class="me-2">{{ rating }} ★</span>
                    <div class="progress flex-grow-1 me-2">
                      <div
                        class="progress-bar"
                        :style="{ width: getRatingPercentage(rating) + '%' }"
                      ></div>
                    </div>
                    <small>{{ getRatingCount(rating) }}</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <h6>Recent Ratings</h6>
                <div class="list-group list-group-flush">
                  <div
                    class="list-group-item"
                    v-for="rating in recentRatings.slice(0, 5)"
                    :key="rating.id"
                  >
                    <div class="d-flex justify-content-between">
                      <span>{{ rating.userName }}</span>
                      <span>
                        <span v-for="n in rating.score" :key="n">★</span>
                        <span class="text-muted ms-1">{{ rating.date }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating System -->
      <div v-if="currentPage === 'rating' && currentUser" class="container mt-4">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="card">
              <div class="card-header">
                <h4><i class="fas fa-star me-2"></i>Rate Our Platform</h4>
              </div>
              <div class="card-body">
                <div class="text-center mb-4">
                  <h5>How would you rate your experience with WomenCare?</h5>
                  <div class="rating-stars mb-3">
                    <i
                      v-for="n in 5"
                      :key="n"
                      :class="[
                        'fas fa-star',
                        { 'text-warning': n <= currentRating, 'text-muted': n > currentRating },
                      ]"
                      @click="setRating(n)"
                      style="font-size: 2rem; cursor: pointer; margin: 0 5px"
                    >
                    </i>
                  </div>
                  <p class="text-muted">{{ getRatingText(currentRating) }}</p>
                </div>

                <div class="mb-3">
                  <label class="form-label">Comments (Optional)</label>
                  <textarea
                    class="form-control"
                    v-model="ratingComment"
                    rows="3"
                    placeholder="Tell us about your experience..."
                  ></textarea>
                </div>

                <div class="text-center">
                  <button
                    class="btn btn-primary"
                    @click="submitRating"
                    :disabled="currentRating === 0"
                  >
                    <i class="fas fa-paper-plane me-2"></i>Submit Rating
                  </button>
                </div>
              </div>
            </div>

            <!-- Platform Rating Summary -->
            <div class="card mt-4">
              <div class="card-header">
                <h5>Platform Rating Summary</h5>
              </div>
              <div class="card-body">
                <div class="row text-center">
                  <div class="col-md-4">
                    <h2 class="text-primary">{{ platformStats.averageRating.toFixed(1) }}</h2>
                    <div class="mb-2">
                      <span
                        v-for="n in Math.floor(platformStats.averageRating)"
                        :key="n"
                        class="text-warning"
                        >★</span
                      >
                      <span
                        v-for="n in 5 - Math.floor(platformStats.averageRating)"
                        :key="'empty-' + n"
                        class="text-muted"
                        >★</span
                      >
                    </div>
                    <p class="text-muted">Average Rating</p>
                  </div>
                  <div class="col-md-4">
                    <h2 class="text-success">{{ platformStats.totalRatings }}</h2>
                    <p class="text-muted">Total Ratings</p>
                  </div>
                  <div class="col-md-4">
                    <h2 class="text-info">{{ getRecommendationPercentage() }}%</h2>
                    <p class="text-muted">Would Recommend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Access Denied Message -->
      <div v-if="currentPage !== 'auth' && !currentUser" class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <i class="fas fa-lock fa-5x text-muted mb-3"></i>
            <h3>Access Required</h3>
            <p class="text-muted mb-4">Please log in to access this feature.</p>
            <button class="btn btn-primary" @click="currentPage = 'auth'">
              <i class="fas fa-sign-in-alt me-2"></i>Login / Register
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer bg-dark text-white mt-auto">
      <div class="container py-4">
        <div class="row">
          <div class="col-md-6">
            <h5><i class="fas fa-heart me-2"></i>WomenCare</h5>
            <p class="mb-0">Empowering women's health through technology and community support.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <p class="mb-1">Contact: support@womencare.com</p>
            <p class="mb-0">&copy; 2024 WomenCare Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import Form from './components/Form.vue'
import AuthSystem from './components/AuthSystem.vue'

export default {
  name: 'App',
  components: {
    Form,
    AuthSystem,
  },
  data() {
    return {
      currentPage: 'auth',
      currentUser: null,
      currentRating: 0,
      ratingComment: '',
      platformStats: {
        totalUsers: 0,
        healthProfiles: 0,
        averageRating: 0,
        totalRatings: 0,
      },
      allUsers: [],
      recentRatings: [],
    }
  },
  computed: {
    // XSS Protection: Sanitize user input
    sanitizedUserName() {
      if (!this.currentUser) return ''
      return this.sanitizeInput(this.currentUser.name)
    },
  },
  methods: {
    // XSS Protection method
    sanitizeInput(input) {
      if (!input) return ''
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/[<>]/g, '')
    },

    handleLoginSuccess(user) {
      this.currentUser = user
      this.currentPage = 'dashboard'
      this.loadPlatformData()
    },

    logout() {
      localStorage.removeItem('currentUser')
      this.currentUser = null
      this.currentPage = 'auth'
    },

    loadPlatformData() {
      // Load users
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
      const demoUsers = [
        { id: 1, name: 'Demo User', email: 'user@demo.com', role: 'user', createdAt: '2024-01-01' },
        {
          id: 2,
          name: 'Admin User',
          email: 'admin@demo.com',
          role: 'admin',
          createdAt: '2024-01-01',
        },
      ]
      this.allUsers = [...demoUsers, ...registeredUsers]

      // Load health profiles
      const healthProfiles = JSON.parse(localStorage.getItem('healthProfiles') || '[]')

      // Load ratings
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      this.recentRatings = ratings.sort((a, b) => new Date(b.date) - new Date(a.date))

      // Calculate stats
      this.platformStats = {
        totalUsers: this.allUsers.length,
        healthProfiles: healthProfiles.length,
        averageRating: ratings.length
          ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
          : 0,
        totalRatings: ratings.length,
      }
    },

    setRating(rating) {
      this.currentRating = rating
    },

    getRatingText(rating) {
      const texts = {
        0: 'Please select a rating',
        1: 'Very Poor',
        2: 'Poor',
        3: 'Average',
        4: 'Good',
        5: 'Excellent',
      }
      return texts[rating] || ''
    },

    submitRating() {
      if (this.currentRating === 0) return

      const newRating = {
        id: Date.now(),
        userId: this.currentUser.id,
        userName: this.sanitizeInput(this.currentUser.name),
        score: this.currentRating,
        comment: this.sanitizeInput(this.ratingComment),
        date: new Date().toLocaleDateString(),
      }

      const existingRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

      // Remove previous rating from this user
      const filteredRatings = existingRatings.filter((r) => r.userId !== this.currentUser.id)
      filteredRatings.push(newRating)

      localStorage.setItem('platformRatings', JSON.stringify(filteredRatings))

      this.currentRating = 0
      this.ratingComment = ''
      this.loadPlatformData()

      alert('Thank you for your rating!')
    },

    getRatingPercentage(rating) {
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      if (ratings.length === 0) return 0
      const count = ratings.filter((r) => r.score === rating).length
      return (count / ratings.length) * 100
    },

    getRatingCount(rating) {
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      return ratings.filter((r) => r.score === rating).length
    },

    getRecommendationPercentage() {
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      if (ratings.length === 0) return 0
      const positiveRatings = ratings.filter((r) => r.score >= 4).length
      return Math.round((positiveRatings / ratings.length) * 100)
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
  },

  mounted() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser)
      this.currentPage = 'dashboard'
    }
    this.loadPlatformData()
  },
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.footer {
  margin-top: auto;
}

.rating-stars i {
  transition: color 0.2s ease;
}

.rating-stars i:hover {
  color: #ffc107 !important;
}

.progress {
  height: 20px;
}

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
