<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-envelope me-2"></i>Send Email</h4>
          </div>
          <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>

            <form @submit.prevent="sendEmail">
              <div class="mb-3">
                <label class="form-label">To Email *</label>
                <input type="email" class="form-control" v-model="formData.toEmail" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Subject *</label>
                <input type="text" class="form-control" v-model="formData.subject" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Message *</label>
                <textarea
                  class="form-control"
                  v-model="formData.message"
                  rows="6"
                  required
                ></textarea>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="isLoading">
                <span v-if="isLoading">
                  <i class="fas fa-spinner fa-spin me-2"></i>Sending...
                </span>
                <span v-else> <i class="fas fa-paper-plane me-2"></i>Send Email </span>
              </button>
            </form>
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
      formData: {
        toEmail: '',
        subject: '',
        message: '',
      },
      isLoading: false,
      errorMessage: '',
      successMessage: '',
    }
  },
  methods: {
    async sendEmail() {
      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const response = await fetch('/.netlify/functions/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email')
        }

        this.successMessage = 'Email sent successfully!'
        this.formData.toEmail = ''
        this.formData.subject = ''
        this.formData.message = ''
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>
