<template>
  <div id="app">
    <!-- Navigation Bar with Role-based Authentication -->
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
                @click="navigateTo('dashboard')"
              >
                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
              </a>
            </li>

            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'profile' }"
                href="#"
                @click="navigateTo('profile')"
              >
                <i class="fas fa-user me-1"></i>Health Profile
              </a>
            </li>

            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'rating' }"
                href="#"
                @click="navigateTo('rating')"
              >
                <i class="fas fa-star me-1"></i>Rate Platform
              </a>
            </li>

            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'email' }"
                href="#"
                @click="navigateTo('email')"
              >
                <i class="fas fa-envelope me-1"></i>Send Email
              </a>
            </li>
            <li class="nav-item" v-if="currentUser">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'reports' }"
                href="#"
                @click="navigateTo('reports')"
              >
                <i class="fas fa-chart-line me-1"></i>My Reports
              </a>
            </li>

            <li class="nav-item" v-if="isAdmin">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'admin' }"
                href="#"
                @click="navigateTo('admin')"
              >
                <i class="fas fa-cog me-1"></i>Admin Panel
              </a>
            </li>

            <li class="nav-item" v-if="isAdmin">
              <a
                class="nav-link"
                :class="{ active: currentPage === 'userManagement' }"
                href="#"
                @click="navigateTo('userManagement')"
              >
                <i class="fas fa-users-cog me-1"></i>User Management
              </a>
            </li>
          </ul>

          <ul class="navbar-nav">
            <li class="nav-item" v-if="!currentUser">
              <a class="nav-link" href="#" @click="navigateTo('auth')">
                <i class="fas fa-sign-in-alt me-1"></i>Login / Register
              </a>
            </li>

            <li class="nav-item" v-if="currentUser">
              <span class="nav-link">
                <i class="fas fa-user-circle me-1"></i>
                {{ currentUser.name }}
                <span class="badge ms-1" :class="getUserRoleBadgeClass(currentUser.role)">
                  {{ getUserRoleDisplay(currentUser.role) }}
                </span>
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

    <div v-if="accessDenied" class="alert alert-warning alert-dismissible fade show" role="alert">
      <div class="container">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Access Denied:</strong> {{ accessDeniedMessage }}
        <button type="button" class="btn-close" @click="accessDenied = false"></button>
      </div>
    </div>

    <main>
      <AuthSystem
        v-if="currentPage === 'auth' && !currentUser"
        @login-success="handleLoginSuccess"
      />
      <EmailForm v-if="currentPage === 'email' && currentUser" />

      <div v-if="currentPage === 'dashboard' && currentUser" class="container mt-4">
        <div class="row">
          <div class="col-12">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2>Welcome to Your Dashboard, {{ currentUser.name }}!</h2>
                <p class="text-muted mb-0">
                  You are logged in as:
                  <span class="badge ms-1" :class="getUserRoleBadgeClass(currentUser.role)">
                    {{ getUserRoleDisplay(currentUser.role) }}
                  </span>
                </p>
              </div>
              <div class="role-permissions-info">
                <div class="card border-info">
                  <div class="card-body p-3">
                    <h6 class="card-title mb-2">
                      <i class="fas fa-info-circle me-1"></i>Your Permissions
                    </h6>
                    <ul class="list-unstyled mb-0 small">
                      <li
                        v-for="permission in getUserPermissions(currentUser.role)"
                        :key="permission"
                      >
                        <i class="fas fa-check text-success me-1"></i>{{ permission }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row">
          <div v-if="currentUser.role === 'user'" class="col-12">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card bg-primary text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-file-medical fa-2x mb-2"></i>
                    <h4>{{ userStats.profilesCreated }}</h4>
                    <small>Health Profiles</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-success text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-star fa-2x mb-2"></i>
                    <h4>{{ userStats.ratingsGiven }}</h4>
                    <small>Ratings Given</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-info text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-calendar fa-2x mb-2"></i>
                    <h4>{{ userStats.daysSinceJoined }}</h4>
                    <small>Days Since Joined</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <button
                      class="btn btn-outline-primary btn-sm w-100"
                      @click="navigateTo('profile')"
                    >
                      <i class="fas fa-user-edit me-1"></i>Update Health Profile
                    </button>
                  </div>
                  <div class="col-md-6 mb-2">
                    <button
                      class="btn btn-outline-success btn-sm w-100"
                      @click="navigateTo('rating')"
                    >
                      <i class="fas fa-star me-1"></i>Rate Platform
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="currentUser.role === 'admin'" class="col-12">
            <div class="row">
              <div class="col-md-3 mb-3">
                <div class="card bg-primary text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-users fa-2x mb-2"></i>
                    <h4>{{ adminStats.totalUsers }}</h4>
                    <small>Total Users</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card bg-success text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-file-medical fa-2x mb-2"></i>
                    <h4>{{ adminStats.totalProfiles }}</h4>
                    <small>Health Profiles</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card bg-warning text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-star fa-2x mb-2"></i>
                    <h4>{{ adminStats.averageRating.toFixed(1) }}</h4>
                    <small>Average Rating</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="card bg-info text-white">
                  <div class="card-body text-center">
                    <i class="fas fa-chart-line fa-2x mb-2"></i>
                    <h4>{{ adminStats.totalRatings }}</h4>
                    <small>Total Ratings</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <h5><i class="fas fa-tools me-2"></i>Admin Quick Actions</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-2">
                    <button
                      class="btn btn-outline-primary btn-sm w-100"
                      @click="navigateTo('userManagement')"
                    >
                      <i class="fas fa-users-cog me-1"></i>Manage Users
                    </button>
                  </div>
                  <div class="col-md-4 mb-2">
                    <button
                      class="btn btn-outline-success btn-sm w-100"
                      @click="navigateTo('admin')"
                    >
                      <i class="fas fa-cog me-1"></i>System Settings
                    </button>
                  </div>
                  <div class="col-md-4 mb-2">
                    <button
                      class="btn btn-outline-info btn-sm w-100"
                      @click="navigateTo('reports')"
                    >
                      <i class="fas fa-chart-pie me-1"></i>View Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form v-if="currentPage === 'profile' && currentUser" />

      <RatingSystem
        v-if="currentPage === 'rating' && currentUser"
        @rating-updated="handleRatingUpdate"
      />

      <div v-if="currentPage === 'reports' && currentUser" class="container mt-4">
        <h2><i class="fas fa-chart-line me-2"></i>Reports Dashboard</h2>

        <div v-if="currentUser.role === 'user'" class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5>My Personal Health Reports</h5>
              </div>
              <div class="card-body">
                <p class="text-muted mb-3">View your personal health data and progress</p>
                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Personal reports show your health profile data and rating history.
                </div>
                <button class="btn btn-primary" disabled>
                  <i class="fas fa-download me-1"></i>Download My Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentUser.role === 'admin'" class="row">
          <div class="col-12">
            <div class="card mb-4">
              <div class="card-header">
                <h5>System-wide Analytics</h5>
              </div>
              <div class="card-body">
                <p class="text-muted mb-3">Comprehensive platform analytics and user insights</p>
                <div class="row">
                  <div class="col-md-6">
                    <h6>User Demographics</h6>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Regular Users</span>
                        <strong>{{ getRegularUsersCount() }}</strong>
                      </li>
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Admin Users</span>
                        <strong>{{ getAdminUsersCount() }}</strong>
                      </li>
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Active This Month</span>
                        <strong>{{ Math.round(adminStats.totalUsers * 0.8) }}</strong>
                      </li>
                    </ul>
                  </div>
                  <div class="col-md-6">
                    <h6>Platform Metrics</h6>
                    <ul class="list-group list-group-flush">
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Health Profiles</span>
                        <strong>{{ adminStats.totalProfiles }}</strong>
                      </li>
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Platform Ratings</span>
                        <strong>{{ adminStats.totalRatings }}</strong>
                      </li>
                      <li class="list-group-item d-flex justify-content-between">
                        <span>Avg. Rating</span>
                        <strong>{{ adminStats.averageRating.toFixed(2) }}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="mt-3">
                  <button class="btn btn-success me-2">
                    <i class="fas fa-download me-1"></i>Export Full Report
                  </button>
                  <button class="btn btn-outline-primary">
                    <i class="fas fa-chart-pie me-1"></i>View Analytics Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentPage === 'admin' && isAdmin" class="container mt-4">
        <h2><i class="fas fa-cog me-2"></i>Admin Panel</h2>

        <div class="card mb-4">
          <div class="card-header">
            <h5>System Overview</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Platform Statistics</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td>Total Users:</td>
                      <td>
                        <strong>{{ adminStats.totalUsers }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Regular Users:</td>
                      <td>
                        <strong>{{ getRegularUsersCount() }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Admin Users:</td>
                      <td>
                        <strong>{{ getAdminUsersCount() }}</strong>
                      </td>
                    </tr>
                    <tr>
                      <td>Health Profiles:</td>
                      <td>
                        <strong>{{ adminStats.totalProfiles }}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6>Recent Activity</h6>
                <div class="list-group list-group-flush">
                  <div class="list-group-item">
                    <i class="fas fa-user-plus text-success me-2"></i>
                    New user registration
                    <small class="text-muted d-block">2 hours ago</small>
                  </div>
                  <div class="list-group-item">
                    <i class="fas fa-star text-warning me-2"></i>
                    Platform rating submitted
                    <small class="text-muted d-block">4 hours ago</small>
                  </div>
                  <div class="list-group-item">
                    <i class="fas fa-file-medical text-info me-2"></i>
                    Health profile updated
                    <small class="text-muted d-block">6 hours ago</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentPage === 'userManagement' && isAdmin" class="container mt-4">
        <h2><i class="fas fa-users-cog me-2"></i>User Management</h2>

        <div class="card">
          <div class="card-header">
            <h5>All Users</h5>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in allUsers" :key="user.id">
                    <td>{{ user.name }}</td>
                    <td>{{ user.email }}</td>
                    <td>
                      <span class="badge" :class="getUserRoleBadgeClass(user.role)">
                        {{ getUserRoleDisplay(user.role) }}
                      </span>
                    </td>
                    <td>{{ formatDate(user.createdAt || '2024-01-01') }}</td>
                    <td>
                      <span class="badge bg-success">Active</span>
                    </td>
                    <td>
                      <button
                        class="btn btn-sm btn-outline-primary me-1"
                        :disabled="user.id === currentUser.id"
                        @click="viewUserDetails(user)"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-warning"
                        :disabled="user.id === currentUser.id"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="currentPage !== 'auth' && !currentUser" class="container mt-5">
        <div class="row justify-content-center">
          <div class="col-md-6 text-center">
            <i class="fas fa-lock fa-5x text-muted mb-3"></i>
            <h3>Authentication Required</h3>
            <p class="text-muted mb-4">Please log in to access this feature.</p>
            <button class="btn btn-primary" @click="navigateTo('auth')">
              <i class="fas fa-sign-in-alt me-2"></i>Login / Register
            </button>
          </div>
        </div>
      </div>
    </main>

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
import RatingSystem from './components/RatingSystem.vue'
import { sanitizeInput, logSecurityEvent } from './utils/security.js'
import EmailForm from './components/EmailForm.vue'

export default {
  name: 'App',
  components: {
    Form,
    AuthSystem,
    RatingSystem,
    EmailForm,
  },
  data() {
    return {
      currentPage: 'auth',
      currentUser: null,
      accessDenied: false,
      accessDeniedMessage: '',
      adminStats: {
        totalUsers: 0,
        totalProfiles: 0,
        averageRating: 0,
        totalRatings: 0,
      },
      userStats: {
        profilesCreated: 0,
        ratingsGiven: 0,
        daysSinceJoined: 0,
      },
      allUsers: [],
      recentRatings: [],
    }
  },
  computed: {
    isAdmin() {
      return this.currentUser && this.currentUser.role === 'admin'
    },
    isUser() {
      return this.currentUser && this.currentUser.role === 'user'
    },
  },
  methods: {
    sanitizeInput(input) {
      return sanitizeInput(input)
    },

    navigateTo(page) {
      if (!this.hasAccessToPage(page)) {
        this.showAccessDenied(page)
        return
      }
      this.currentPage = page
      this.accessDenied = false
    },

    hasAccessToPage(page) {
      const publicPages = ['auth']
      if (publicPages.includes(page)) {
        return true
      }
      if (!this.currentUser) {
        return false
      }
      const userPages = ['dashboard', 'profile', 'rating', 'reports', 'email']
      if (userPages.includes(page)) {
        return true
      }
      const adminPages = ['admin', 'userManagement']
      if (adminPages.includes(page)) {
        return this.currentUser.role === 'admin'
      }
      return false
    },

    showAccessDenied(page) {
      this.accessDenied = true
      if (!this.currentUser) {
        this.accessDeniedMessage = 'You must be logged in to access this page.'
      } else if (page === 'admin' || page === 'userManagement') {
        this.accessDeniedMessage = 'This page is restricted to administrators only.'
      } else {
        this.accessDeniedMessage = 'You do not have permission to access this page.'
      }
    },

    getUserRoleDisplay(role) {
      const roleMap = {
        user: 'User',
        admin: 'Administrator',
      }
      return roleMap[role] || role
    },

    getUserRoleBadgeClass(role) {
      const classMap = {
        user: 'bg-primary',
        admin: 'bg-danger',
      }
      return classMap[role] || 'bg-secondary'
    },

    getUserPermissions(role) {
      const permissions = {
        user: [
          'View dashboard',
          'Create health profiles',
          'Rate platform',
          'View personal reports',
        ],
        admin: [
          'All user permissions',
          'Manage all users',
          'Access admin panel',
          'View system analytics',
        ],
      }
      return permissions[role] || []
    },

    getRegularUsersCount() {
      return this.allUsers.filter((user) => user.role === 'user').length
    },

    getAdminUsersCount() {
      return this.allUsers.filter((user) => user.role === 'admin').length
    },

    viewUserDetails(user) {
      if (!this.isAdmin) {
        this.showAccessDenied('userManagement')
        return
      }
      alert(
        `User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${this.getUserRoleDisplay(user.role)}\nJoined: ${this.formatDate(user.createdAt || '2024-01-01')}`,
      )
    },

    handleLoginSuccess(user) {
      this.currentUser = {
        ...user,
        name: this.sanitizeInput(user.name),
        email: this.sanitizeInput(user.email),
      }
      this.currentPage = 'dashboard'
      this.loadPlatformData()
      this.loadUserStats()

      logSecurityEvent('USER_SESSION_START', {
        userId: user.id,
        userRole: user.role,
      })
    },

    handleRatingUpdate(newRating) {
      const sanitizedRating = {
        ...newRating,
        userName: this.sanitizeInput(newRating.userName),
        comment: this.sanitizeInput(newRating.comment),
      }

      this.loadPlatformData()
      this.loadUserStats()
      this.showMobileNotification('Rating submitted successfully!')

      logSecurityEvent('RATING_SUBMITTED', {
        userId: this.currentUser?.id,
        ratingScore: sanitizedRating.score,
      })
    },

    logout() {
      logSecurityEvent('USER_LOGOUT', {
        userId: this.currentUser?.id,
        userRole: this.currentUser?.role,
        sessionDuration: this.currentUser?.loginTime
          ? Date.now() - new Date(this.currentUser.loginTime).getTime()
          : 0,
      })

      localStorage.removeItem('currentUser')
      this.currentUser = null
      this.currentPage = 'auth'
      this.accessDenied = false
    },

    loadPlatformData() {
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

      const healthProfiles = JSON.parse(localStorage.getItem('healthProfiles') || '[]')
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      this.recentRatings = ratings.sort((a, b) => new Date(b.date) - new Date(a.date))

      this.adminStats = {
        totalUsers: this.allUsers.length,
        totalProfiles: healthProfiles.length,
        averageRating: ratings.length
          ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
          : 0,
        totalRatings: ratings.length,
      }
    },

    loadUserStats() {
      if (!this.currentUser) return

      const healthProfiles = JSON.parse(localStorage.getItem('healthProfiles') || '[]')
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')

      const userProfiles = healthProfiles.filter((p) => p.email === this.currentUser.email).length
      const userRatings = ratings.filter((r) => r.userId === this.currentUser.id).length

      const joinDate = this.currentUser.createdAt
        ? new Date(this.currentUser.createdAt)
        : new Date()
      const daysSinceJoined = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24))

      this.userStats = {
        profilesCreated: userProfiles,
        ratingsGiven: userRatings,
        daysSinceJoined: Math.max(1, daysSinceJoined),
      }
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    showMobileNotification(message) {
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
    },

    performSecurityChecks() {
      if (window.top !== window.self) {
        logSecurityEvent('CLICKJACKING_ATTEMPT', {
          topOrigin: window.top.location.origin,
          selfOrigin: window.self.location.origin,
        })
        console.warn('Application loaded in iframe - potential clickjacking attempt')
      }

      logSecurityEvent('APP_LOADED', {
        userAgent: navigator.userAgent.substring(0, 100),
        timestamp: new Date().toISOString(),
      })
    },
  },

  mounted() {
    this.performSecurityChecks()

    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
        this.currentPage = 'dashboard'

        logSecurityEvent('USER_SESSION_RESTORED', {
          userId: this.currentUser.id,
          userRole: this.currentUser.role,
        })
      } catch (error) {
        localStorage.removeItem('currentUser')
        logSecurityEvent('SESSION_RESTORE_ERROR', { error: error.message })
      }
    }
    this.loadPlatformData()
    this.loadUserStats()
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

.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: none;
}

.badge {
  font-size: 0.75em;
}

.role-permissions-info {
  max-width: 300px;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.alert {
  border: none;
  border-radius: 0;
}

.bg-danger {
  background-color: #dc3545 !important;
}

.bg-primary {
  background-color: #0d6efd !important;
}

@media (max-width: 991.98px) {
  .navbar-nav {
    padding: 1rem 0;
  }

  .navbar-nav .nav-item {
    margin: 0.25rem 0;
  }

  .navbar-nav .nav-link {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    margin: 0.25rem 0;
    transition: background-color 0.3s ease;
  }

  .role-permissions-info {
    max-width: 100%;
    margin-top: 1rem;
  }
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
