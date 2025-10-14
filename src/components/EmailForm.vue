<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-envelope me-2"></i>Send Email with Attachment</h4>
          </div>
          <div class="card-body">
            <div v-if="errorMessage" class="alert alert-danger alert-dismissible fade show">
              <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
            </div>

            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show">
              <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>

            <form @submit.prevent="sendEmail">
              <div class="mb-3">
                <label class="form-label">From Name</label>
                <input type="text" class="form-control" v-model="formData.fromName" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">From Email</label>
                <input type="email" class="form-control" v-model="formData.fromEmail" readonly />
              </div>

              <div class="mb-3">
                <label class="form-label">To Email *</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="formData.toEmail"
                  required
                  placeholder="recipient@example.com"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Subject *</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="formData.subject"
                  required
                  placeholder="Email subject"
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Message *</label>
                <textarea
                  class="form-control"
                  v-model="formData.message"
                  rows="6"
                  required
                  placeholder="Your message here..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Attachment (Optional)</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileUpload"
                  ref="fileInput"
                />
                <small class="text-muted">Max file size: 5MB</small>
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
        fromName: 'WomenCare Platform',
        fromEmail: 'nsun0014@student.monash.edu',
        toEmail: '',
        subject: '',
        message: '',
      },
      attachment: null,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) {
        this.attachment = null
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB'
        this.$refs.fileInput.value = ''
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        this.attachment = {
          content: e.target.result.split(',')[1],
          filename: file.name,
          type: file.type,
        }
      }
      reader.readAsDataURL(file)
    },

    async sendEmail() {
      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const payload = {
          to: this.formData.toEmail,
          subject: this.formData.subject,
          message: this.formData.message,
        }

        if (this.attachment) {
          payload.attachment = this.attachment
        }

        const response = await fetch('/.netlify/functions/sendEmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email')
        }

        this.successMessage = 'Email sent successfully!'
        this.formData.toEmail = ''
        this.formData.subject = ''
        this.formData.message = ''
        this.attachment = null
        this.$refs.fileInput.value = ''
      } catch (error) {
        console.error('Email sending error:', error)
        this.errorMessage = error.message || 'Failed to send email. Please try again.'
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
