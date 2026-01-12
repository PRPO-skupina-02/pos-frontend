<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Select Room</h1>
      <router-link to="/" class="btn btn-outline-secondary"> ← Back to Theaters </router-link>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading rooms...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">Error loading rooms: {{ error.message }}</div>

    <div v-else-if="rooms.length === 0" class="alert alert-info">
      No rooms available in this theater.
    </div>

    <div v-else class="row g-3">
      <div v-for="room in rooms" :key="room.id" class="col-md-6 col-lg-4">
        <div class="card h-100 room-card" role="button" @click="selectRoom(room.id!)">
          <div class="card-body">
            <h5 class="card-title">{{ room.name }}</h5>
            <div class="text-muted small">
              <div class="mb-2">
                <strong>Capacity:</strong> {{ (room.rows || 0) * (room.columns || 0) }} seats
              </div>
              <div class="mb-2">
                <strong>Layout:</strong> {{ room.rows }} rows × {{ room.columns }} columns
              </div>
              <div v-if="room.operating_mode"><strong>Mode:</strong> {{ room.operating_mode }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoomsList } from '@/api/spored/rooms/rooms';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const theaterId = computed(() => route.params.theaterId as string);

const { data, isLoading, error } = useRoomsList(theaterId);

const rooms = computed(() => {
  const response = data.value?.data;
  return response || [];
});

function selectRoom(roomId: string) {
  router.push({
    name: 'timeslots',
    params: {
      theaterId: theaterId.value,
      roomId,
    },
  });
}
</script>
