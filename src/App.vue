<script setup lang="ts">
import { onMounted } from 'vue'
import AppFooter from './components/AppFooter.vue'
import AppNavbar from './components/AppNavbar.vue'
import { useAuth } from './composables/useAuth'

const { token, fetchCurrentUser } = useAuth()

onMounted(() => {
  if (token.value) {
    fetchCurrentUser()
  }
})
</script>

<template>
  <div class="min-vh-100 d-flex flex-column">
    <AppNavbar />

    <main>
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>
