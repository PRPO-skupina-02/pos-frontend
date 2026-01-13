<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppFooter from './components/AppFooter.vue'
import AppNavbar from './components/AppNavbar.vue'
import { useAuth } from './composables/useAuth'

const { token, fetchCurrentUser } = useAuth()
const route = useRoute()

const isAdvertisingView = computed(() => route.name === 'advertising')

onMounted(() => {
  if (token.value) {
    fetchCurrentUser()
  }
})
</script>

<template>
  <div class="min-vh-100 d-flex flex-column">
    <AppNavbar v-if="!isAdvertisingView" />

    <main>
      <RouterView />
    </main>

    <AppFooter v-if="!isAdvertisingView" />
  </div>
</template>
