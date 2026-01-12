<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Select Timeslot</h1>
      <router-link :to="{ name: 'rooms', params: { theaterId } }" class="btn btn-outline-secondary">
        ← Back to Rooms
      </router-link>
    </div>

    <div v-if="isLoadingAny" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading timeslots...</span>
      </div>
    </div>

    <div v-else class="row g-3">
      <div v-for="day in days" :key="day.dateString" class="col-md-4">
        <div class="card h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">{{ day.label }}</h5>
            <small>{{ day.dateString }}</small>
          </div>
          <div class="card-body p-0">
            <div v-if="day.error" class="alert alert-danger m-3">Error loading timeslots</div>
            <div v-else-if="day.timeslots.length === 0" class="p-3 text-muted">
              No timeslots available
            </div>
            <div v-else class="list-group list-group-flush">
              <button v-for="timeslot in day.timeslots" :key="timeslot.id" type="button"
                class="list-group-item list-group-item-action" @click="selectTimeslot(timeslot.id!)">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="mb-1">{{ getMovieName(timeslot.movie_id) }}</h6>
                    <small class="text-muted">
                      {{ formatTime(timeslot.start_time) }} -
                      {{ formatTime(timeslot.end_time) }} ({{
                        calculateDuration(timeslot.start_time, timeslot.end_time)
                      }})
                    </small>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiTimeSlotResponse } from '@/api/spored/model';
import { useMoviesList } from '@/api/spored/movies/movies';
import { useTimeSlotsList } from '@/api/spored/timeslots/timeslots';
import { calculateDuration, formatTime } from '@/util/time';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const theaterId = computed(() => route.params.theaterId as string);
const roomId = computed(() => route.params.roomId as string);

// Calculate the three dates
const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(today.getDate() + 2);

const todayString = today.toISOString().split('T')[0];
const tomorrowString = tomorrow.toISOString().split('T')[0];
const dayAfterTomorrowString = dayAfterTomorrow.toISOString().split('T')[0];

// Fetch timeslots for each day
const todayQuery = useTimeSlotsList(theaterId, roomId, { date: todayString, limit: 50 });
const tomorrowQuery = useTimeSlotsList(theaterId, roomId, { date: tomorrowString, limit: 50 });
const dayAfterQuery = useTimeSlotsList(theaterId, roomId, {
  date: dayAfterTomorrowString,
  limit: 50,
});

const movieQuery = useMoviesList();

const movies = computed(() => {
  const response = movieQuery.data.value?.data;
  return response || [];
});

const isLoadingAny = computed(() => {
  return (
    todayQuery.isLoading.value ||
    tomorrowQuery.isLoading.value ||
    dayAfterQuery.isLoading.value ||
    movieQuery.isLoading.value
  );
});

const days = computed(() => [
  {
    label: 'Today',
    dateString: todayString,
    timeslots: (todayQuery.data.value?.data || []) as ApiTimeSlotResponse[],
    error: todayQuery.error.value,
  },
  {
    label: 'Tomorrow',
    dateString: tomorrowString,
    timeslots: (tomorrowQuery.data.value?.data || []) as ApiTimeSlotResponse[],
    error: tomorrowQuery.error.value,
  },
  {
    label: 'Day After Tomorrow',
    dateString: dayAfterTomorrowString,
    timeslots: (dayAfterQuery.data.value?.data || []) as ApiTimeSlotResponse[],
    error: dayAfterQuery.error.value,
  },
]);

function getMovieName(movieId?: string): string {
  if (!movieId) return 'Unknown Movie';
  const movie = movies.value.find((m) => m.id === movieId);
  return movie?.name || `Movie ID: ${movieId.substring(0, 8)}`;
}

function selectTimeslot(timeslotId: string) {
  router.push({
    name: 'timeslot-details',
    params: {
      theaterId: theaterId.value,
      roomId: roomId.value,
      timeslotId,
    },
  });
}
</script>
