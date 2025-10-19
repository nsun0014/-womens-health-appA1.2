<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-envelope me-2"></i>Send Email</h4>
          </div>

          <div class="card-body">
            <form @submit.prevent="sendEmail">
              <div class="mb-3">
                <label class="form-label">To</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="to"
                  required
                  placeholder="recipient@example.com"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Subject</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="subject"
                  required
                  placeholder="Enter email subject"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Message</label>
                <textarea
                  class="form-control"
                  v-model="message"
                  rows="6"
                  required
                  placeholder="Write your message here..."
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="loading">
                <span v-if="loading"> <i class="fas fa-spinner fa-spin me-2"></i>Sending... </span>
                <span v-else> <i class="fas fa-paper-plane me-2"></i>Send Email </span>
              </button>
            </form>

            <div v-if="successMessage" class="alert alert-success mt-3">
              <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
            </div>

            <div v-if="errorMessage" class="alert alert-danger mt-3">
              <i class="fas fa-times-circle me-2"></i>{{ errorMessage }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmailForm',
  data() {
    return {
      to: '',
      subject: '',
      message: '',
      loading: false,
      successMessage: '',
      errorMessage: '',
    }
  },
  methods: {
    async sendEmail() {
      this.loading = true
      this.successMessage = ''
      this.errorMessage = ''

      try {
        // 原版只是模拟发送，不调用外部 API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        this.successMessage = `Email successfully sent to ${this.to}`
        this.to = ''
        this.subject = ''
        this.message = ''
      } catch (err) {
        this.errorMessage = 'Failed to send email. Please try again.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
