<template>
  <div class="container-fluid py-4">
    <h1 class="mb-4">Select Theater</h1>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading theaters...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Error loading theaters: {{ error.message }}
    </div>

    <div v-else-if="theaters.length === 0" class="alert alert-info">No theaters available.</div>

    <div v-else class="row g-3">
      <div v-for="theater in theaters" :key="theater.id" class="col-md-6 col-lg-4">
        <div class="card h-100" role="button" @click="selectTheater(theater.id!)">
          <div class="card-body">
            <h5 class="card-title">{{ theater.name }}</h5>
            <p class="card-text text-muted small">
              <small>Created: {{ formatDate(theater.created_at) }}</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheatersList } from '@/api/spored/theaters/theaters';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { data, isLoading, error } = useTheatersList();

const theaters = computed(() => {
  const response = data.value?.data;
  return response || [];
});

function selectTheater(theaterId: string) {
  router.push({ name: 'rooms', params: { theaterId } });
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return dateString;
  }
}
</script>
