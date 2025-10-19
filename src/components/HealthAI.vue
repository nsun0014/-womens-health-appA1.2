<template>
  <div class="health-ai-card">
    <div class="card">
      <div class="card-header bg-gradient-primary text-white">
        <h2 class="h5 mb-0">
          <i class="fas fa-robot me-2" aria-hidden="true"></i>
          AI Health Assistant
        </h2>
      </div>
      <div class="card-body">
        <p class="text-muted mb-3">
          Get personalized health insights and recommendations powered by AI
        </p>

        <div class="mb-3">
          <label for="healthQuery" class="form-label">Ask about your health:</label>
          <textarea
            id="healthQuery"
            v-model="userQuery"
            class="form-control"
            rows="3"
            placeholder="e.g., What are some tips for better sleep? How can I manage stress?"
            :disabled="loading"
          ></textarea>
        </div>

        <button
          class="btn btn-primary w-100 mb-3"
          @click="getAIAdvice"
          :disabled="loading || !userQuery.trim()"
        >
          <span v-if="loading">
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
            Generating advice...
          </span>
          <span v-else>
            <i class="fas fa-magic me-2" aria-hidden="true"></i>
            Get AI Advice
          </span>
        </button>

        <div v-if="aiResponse" class="alert alert-info" role="region" aria-live="polite">
          <h3 class="h6 mb-2">
            <i class="fas fa-lightbulb me-1" aria-hidden="true"></i>
            AI Recommendation:
          </h3>
          <div class="ai-response-text">{{ aiResponse }}</div>
        </div>

        <div v-if="error" class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>
          {{ error }}
        </div>

        <div class="alert alert-warning mt-3" role="note">
          <small>
            <i class="fas fa-info-circle me-1" aria-hidden="true"></i>
            <strong>Disclaimer:</strong> AI advice is for informational purposes only. Always
            consult healthcare professionals for medical decisions.
          </small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { GoogleGenerativeAI } from '@google/generative-ai'

export default {
  name: 'HealthAI',
  data() {
    return {
      userQuery: '',
      aiResponse: '',
      loading: false,
      error: '',
      genAI: null,
    }
  },
  mounted() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    console.log('API Key loaded:', apiKey ? 'Yes' : 'No')
    console.log('API Key length:', apiKey ? apiKey.length : 0)

    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey)
    } else {
      this.error = 'API key not configured. Please add VITE_GEMINI_API_KEY to .env file'
      console.error('Missing API key in environment variables')
    }
  },
  methods: {
    async getAIAdvice() {
      if (!this.userQuery.trim()) return

      this.loading = true
      this.error = ''
      this.aiResponse = ''

      try {
        const model = this.genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-exp',
        })

        const prompt = `As a women's health assistant, provide helpful, evidence-based advice for the following question.
Keep the response concise (under 200 words) and supportive. Always remind users to consult healthcare professionals for serious concerns.

Question: ${this.userQuery}

Provide your response:`

        const result = await model.generateContent(prompt)
        const response = await result.response
        this.aiResponse = response.text()

        this.$emit('ai-query-made', {
          query: this.userQuery,
          response: this.aiResponse,
          timestamp: new Date().toISOString(),
        })
      } catch (err) {
        console.error('AI Error:', err)
        this.error = 'Failed to get AI response. Please try again later.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.health-ai-card {
  margin: 20px 0;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.ai-response-text {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.95rem;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
</style>
