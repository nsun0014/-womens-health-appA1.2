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
            <!-- Dashboard - Available to all authenticated users -->
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

            <!-- Health Profile - Available to all authenticated users -->
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

            <!-- Rating - Available to all authenticated users -->
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

            <!-- Reports - Available to all authenticated users -->
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

            <!-- Admin Panel - Only for admin users -->
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

            <!-- User Management - Only for admin users -->
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
            <!-- Login/Register link for unauthenticated users -->
            <li class="nav-item" v-if="!currentUser">
              <a class="nav-link" href="#" @click="navigateTo('auth')">
                <i class="fas fa-sign-in-alt me-1"></i>Login / Register
              </a>
            </li>

            <!-- User info and logout for authenticated users -->
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

    <!-- Role-based Access Control Alert -->
    <div v-if="accessDenied" class="alert alert-warning alert-dismissible fade show" role="alert">
      <div class="container">
        <i class="fas fa-exclamation-triangle me-2"></i>
        <strong>Access Denied:</strong> {{ accessDeniedMessage }}
        <button type="button" class="btn-close" @click="accessDenied = false"></button>
      </div>
    </div>

    <!-- Main Content -->
    <main>
      <!-- Authentication Page -->
      <AuthSystem
        v-if="currentPage === 'auth' && !currentUser"
        @login-success="handleLoginSuccess"
      />

      <!-- Dashboard - All authenticated users -->
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

        <!-- Role-specific Dashboard Content -->
        <div class="row">
          <!-- User Dashboard -->
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

            <!-- User Quick Actions -->
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

          <!-- Admin Dashboard -->
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

            <!-- Admin Quick Actions -->
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

      <!-- Health Profile Form - All authenticated users -->
      <Form v-if="currentPage === 'profile' && currentUser" />

      <!-- Rating System - All authenticated users -->
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
                    <h2 class="text-primary">{{ adminStats.averageRating.toFixed(1) }}</h2>
                    <div class="mb-2">
                      <span
                        v-for="n in Math.floor(adminStats.averageRating)"
                        :key="n"
                        class="text-warning"
                        >★</span
                      >
                      <span
                        v-for="n in 5 - Math.floor(adminStats.averageRating)"
                        :key="'empty-' + n"
                        class="text-muted"
                        >★</span
                      >
                    </div>
                    <p class="text-muted">Average Rating</p>
                  </div>
                  <div class="col-md-4">
                    <h2 class="text-success">{{ adminStats.totalRatings }}</h2>
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

      <!-- Reports Page - All authenticated users with role-specific content -->
      <div v-if="currentPage === 'reports' && currentUser" class="container mt-4">
        <h2><i class="fas fa-chart-line me-2"></i>Reports Dashboard</h2>

        <!-- User Reports -->
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
                <!-- User-specific report content would go here -->
                <button class="btn btn-primary" disabled>
                  <i class="fas fa-download me-1"></i>Download My Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Reports -->
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

      <!-- Admin Panel - Only admin users -->
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

      <!-- User Management - Only admin users -->
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

      <!-- Access Denied Message -->
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
    // Role-based computed properties
    isAdmin() {
      return this.currentUser && this.currentUser.role === 'admin'
    },

    isUser() {
      return this.currentUser && this.currentUser.role === 'user'
    },

    sanitizedUserName() {
      if (!this.currentUser) return ''
      return this.sanitizeInput(this.currentUser.name)
    },
  },
  methods: {
    // Enhanced XSS Protection
    sanitizeInput(input) {
      if (!input) return ''
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/[<>]/g, '')
    },

    // Role-based Navigation with Access Control
    navigateTo(page) {
      // Check access permissions before navigation
      if (!this.hasAccessToPage(page)) {
        this.showAccessDenied(page)
        return
      }

      this.currentPage = page
      this.accessDenied = false
    },

    // Access Control Logic
    hasAccessToPage(page) {
      // Public pages - no authentication required
      const publicPages = ['auth']
      if (publicPages.includes(page)) {
        return true
      }

      // All other pages require authentication
      if (!this.currentUser) {
        return false
      }

      // Pages available to all authenticated users
      const userPages = ['dashboard', 'profile', 'rating', 'reports']
      if (userPages.includes(page)) {
        return true
      }

      // Admin-only pages
      const adminPages = ['admin', 'userManagement']
      if (adminPages.includes(page)) {
        return this.currentUser.role === 'admin'
      }

      return false
    },

    // Show Access Denied Message
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

    // Role Display Helpers
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

    // Get User Permissions
    getUserPermissions(role) {
      const permissions = {
        user: [
          'View dashboard',
          'Create health profiles',
          'Rate platform',
          'View personal reports',
          'Update account settings',
        ],
        admin: [
          'All user permissions',
          'Manage all users',
          'Access admin panel',
          'View system analytics',
          'Manage platform settings',
          'Export system reports',
        ],
      }
      return permissions[role] || []
    },

    // User Statistics
    getRegularUsersCount() {
      return this.allUsers.filter((user) => user.role === 'user').length
    },

    getAdminUsersCount() {
      return this.allUsers.filter((user) => user.role === 'admin').length
    },

    // View User Details (Admin function)
    viewUserDetails(user) {
      if (!this.isAdmin) {
        this.showAccessDenied('userManagement')
        return
      }

      alert(
        `User Details:\nName: ${user.name}\nEmail: ${user.email}\nRole: ${this.getUserRoleDisplay(user.role)}\nJoined: ${this.formatDate(user.createdAt || '2024-01-01')}`,
      )
    },

    // Authentication Handlers
    handleLoginSuccess(user) {
      this.currentUser = user
      this.currentPage = 'dashboard'
      this.loadPlatformData()
      this.loadUserStats()
    },

    logout() {
      // Log security event
      this.logSecurityEvent('user_logout', {
        userId: this.currentUser?.id,
        userRole: this.currentUser?.role,
      })

      localStorage.removeItem('currentUser')
      this.currentUser = null
      this.currentPage = 'auth'
      this.accessDenied = false
    },

    // Data Loading Functions
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

      // Calculate user-specific stats
      const userProfiles = healthProfiles.filter((p) => p.email === this.currentUser.email).length
      const userRatings = ratings.filter((r) => r.userId === this.currentUser.id).length

      // Calculate days since joined
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

    // Rating System
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
      if (this.currentRating === 0 || !this.currentUser) return

      const newRating = {
        id: Date.now(),
        userId: this.currentUser.id,
        userName: this.sanitizeInput(this.currentUser.name),
        score: this.currentRating,
        comment: this.sanitizeInput(this.ratingComment),
        date: new Date().toLocaleDateString(),
      }

      const existingRatings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      const filteredRatings = existingRatings.filter((r) => r.userId !== this.currentUser.id)
      filteredRatings.push(newRating)

      localStorage.setItem('platformRatings', JSON.stringify(filteredRatings))

      this.currentRating = 0
      this.ratingComment = ''
      this.loadPlatformData()
      this.loadUserStats()

      this.showMobileNotification('Thank you for your rating!')
    },

    getRecommendationPercentage() {
      const ratings = JSON.parse(localStorage.getItem('platformRatings') || '[]')
      if (ratings.length === 0) return 0
      const positiveRatings = ratings.filter((r) => r.score >= 4).length
      return Math.round((positiveRatings / ratings.length) * 100)
    },

    // Utility Functions
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    showMobileNotification(message) {
      if (window.innerWidth <= 768) {
        const notification = document.createElement('div')
        notification.className = 'mobile-notification'
        notification.innerHTML = `
          <button class="close-btn" onclick="this.parentElement.remove()">&times;</button>
          <strong>Success!</strong> ${message}
        `
        const appRoot = document.getElementById('app') || document.body
        appRoot.appendChild(notification)

        setTimeout(() => notification.classList.add('show'), 100)
        setTimeout(() => {
          notification.classList.remove('show')
          setTimeout(() => notification.remove(), 300)
        }, 3000)
      } else {
        alert(message)
      }
    },

    // Security Logging
    logSecurityEvent(eventType, details = {}) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        type: eventType,
        userAgent: navigator.userAgent,
        url: window.location.href,
        details: this.sanitizeInput(JSON.stringify(details)),
      }

      console.warn('Security Event:', logEntry)

      const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
      securityLogs.push(logEntry)

      if (securityLogs.length > 100) {
        securityLogs.splice(0, securityLogs.length - 100)
      }

      localStorage.setItem('securityLogs', JSON.stringify(securityLogs))
    },
  },

  mounted() {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser)
        this.currentPage = 'dashboard'

        // Log login event
        this.logSecurityEvent('user_session_restored', {
          userId: this.currentUser.id,
          userRole: this.currentUser.role,
        })
      } catch (error) {
        localStorage.removeItem('currentUser')
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

.rating-stars i {
  transition: color 0.2s ease;
}

.rating-stars i:hover {
  color: #ffc107 !important;
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

/* Navigation enhancements */
.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

/* Access denied alert */
.alert {
  border: none;
  border-radius: 0;
}

/* Role-specific styling */
.bg-danger {
  background-color: #dc3545 !important;
}

.bg-primary {
  background-color: #0d6efd !important;
}

/* Mobile responsiveness */
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

/* Admin-specific styling */
.admin-badge {
  background: linear-gradient(45deg, #dc3545, #fd7e14);
}

/* Enhanced button states */
.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* Table hover effects */
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Mobile notification for success messages */
:global(.mobile-notification) {
  position: fixed;
  top: 80px;
  right: 20px;
  left: 20px;
  z-index: 9999;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-100px);
  opacity: 0;
  transition: all 0.3s ease;
}

:global(.mobile-notification.show) {
  transform: translateY(0);
  opacity: 1;
}

:global(.mobile-notification .close-btn) {
  background: none;
  border: none;
  color: white;
  font-size: 1.2rem;
  float: right;
  cursor: pointer;
}
</style>
