<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card shadow-sm" style="width: 100%; max-width: 400px">
      <div class="card-body p-4">
        <h2 class="card-title text-center mb-4">POS Terminal Login</h2>

        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-control"
              required
              :disabled="isAuthenticating"
              autocomplete="email"
            />
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-control"
              required
              :disabled="isAuthenticating"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn btn-primary w-100" :disabled="isAuthenticating">
            <span v-if="isAuthenticating" class="spinner-border spinner-border-sm me-2"></span>
            {{ isAuthenticating ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="text-center mt-3">
          <small class="text-muted">For employees and administrators only</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { ref } from 'vue'

const { login, isAuthenticating } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')

async function handleLogin(): Promise<void> {
  errorMessage.value = ''

  try {
    await login(email.value, password.value)
  } catch (err) {
    const error = err as { response?: { data?: { message?: string } }; message?: string }
    errorMessage.value =
      error?.response?.data?.message || error?.message || 'Login failed. Please try again.'
  }
}
</script>
