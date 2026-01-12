<script setup lang="ts">
import AppFooter from './components/AppFooter.vue';
import AppNavbar from './components/AppNavbar.vue';
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
