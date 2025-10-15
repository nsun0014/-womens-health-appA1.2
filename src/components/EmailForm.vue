<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0"><i class="fas fa-envelope me-2"></i>Send Email with Attachment</h4>
          </div>
          <div class="card-body">
            <div class="alert alert-info mb-3">
              <strong>From:</strong> WomenCare Platform (hisomi469@gmail.com)
            </div>

            <div v-if="errorMessage" class="alert alert-danger alert-dismissible">
              <button type="button" class="btn-close" @click="errorMessage = ''"></button>
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success alert-dismissible">
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
              <strong>Success!</strong> Email sent from hisomi469@gmail.com to {{ sentTo }}
            </div>

            <form @submit.prevent="sendEmail">
              <div class="mb-3">
                <label class="form-label">To Email *</label>
                <input
                  type="email"
                  class="form-control"
                  v-model="formData.to"
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
                  placeholder="Enter your message here..."
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Attachment (Optional)</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileUpload"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <small class="text-muted">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 5MB)
                </small>
                <div v-if="attachmentInfo" class="mt-2">
                  <span class="badge bg-info">
                    <i class="fas fa-paperclip me-1"></i>
                    {{ attachmentInfo.name }} ({{ formatFileSize(attachmentInfo.size) }})
                    <button
                      type="button"
                      class="btn-close btn-close-white ms-2"
                      @click="removeAttachment"
                      style="font-size: 0.6rem"
                    ></button>
                  </span>
                </div>
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
        to: '',
        subject: '',
        message: '',
      },
      attachment: null,
      attachmentInfo: null,
      isLoading: false,
      errorMessage: '',
      successMessage: '',
      sentTo: '',
    }
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0]
      if (!file) return

      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 5MB'
        event.target.value = ''
        return
      }

      // Read file as base64
      const reader = new FileReader()
      reader.onload = (e) => {
        this.attachment = {
          content: e.target.result.split(',')[1], // Remove data:image/png;base64, prefix
          filename: file.name,
          type: file.type,
        }
        this.attachmentInfo = {
          name: file.name,
          size: file.size,
        }
      }
      reader.readAsDataURL(file)
    },

    removeAttachment() {
      this.attachment = null
      this.attachmentInfo = null
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) fileInput.value = ''
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    },

    async sendEmail() {
      this.isLoading = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const payload = {
          to: this.formData.to,
          subject: this.formData.subject,
          message: this.formData.message,
        }

        // Add attachment if present
        if (this.attachment) {
          payload.attachment = this.attachment
        }

        const response = await fetch(
          'https://us-central1-women-health1.cloudfunctions.net/sendEmail',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send email')
        }

        this.successMessage = 'Email sent successfully!'
        this.sentTo = this.formData.to
        this.formData.to = ''
        this.formData.subject = ''
        this.formData.message = ''
        this.removeAttachment()
      } catch (error) {
        this.errorMessage = error.message
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style scoped>
.card {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.badge {
  font-size: 0.9rem;
  padding: 0.5rem;
}
</style>
