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

        <div class="mt-3">
          <hr />
          <div class="text-center">
            <button
              type="button"
              class="btn btn-link btn-sm text-decoration-none p-0"
              @click="showTheaterList = !showTheaterList"
            >
              <small> {{ showTheaterList ? '− Hide' : '+ View' }} Advertising Display </small>
            </button>
          </div>

          <div v-if="showTheaterList" class="mt-3">
            <div v-if="theatersLoading" class="text-center">
              <div class="spinner-border spinner-border-sm"></div>
            </div>
            <div v-else-if="theaters.length > 0" class="list-group">
              <router-link
                v-for="theater in theaters"
                :key="theater.id"
                :to="`/advertising/${theater.id}`"
                class="list-group-item list-group-item-action"
              >
                <small>{{ theater.name }}</small>
              </router-link>
            </div>
            <div v-else class="text-center">
              <small class="text-muted">No theaters available</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheatersList } from '@/api/spored/theaters/theaters'
import { useAuth } from '@/composables/useAuth'
import { computed, ref } from 'vue'

const { login, isAuthenticating } = useAuth()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const showTheaterList = ref(false)

const { data: theatersData, isLoading: theatersLoading } = useTheatersList()

const theaters = computed(() => {
  const response = theatersData.value?.data
  return response || []
})

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
