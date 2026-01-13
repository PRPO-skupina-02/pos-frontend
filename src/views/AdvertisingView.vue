<template>
  <div class="bg-dark text-light d-flex flex-column" style="height: 100vh; overflow: hidden">
    <div v-if="isLoading" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="spinner-border text-light" style="width: 4rem; height: 4rem" role="status">
        <span class="visually-hidden">Loading advertisements...</span>
      </div>
    </div>

    <div v-else-if="error" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="alert alert-danger">Error loading advertisements: {{ error.message }}</div>
    </div>

    <div
      v-else-if="!currentAd"
      class="flex-grow-1 d-flex align-items-center justify-content-center"
    >
      <div class="text-center">
        <h2>No advertisements available</h2>
        <p class="text-muted">Please check back later</p>
      </div>
    </div>

    <div v-else class="flex-grow-1 d-flex flex-column">
      <div class="row g-0 flex-grow-1">
        <div
          class="col-lg-4 d-flex align-items-center justify-content-center bg-black overflow-hidden"
        >
          <img
            v-if="currentAd.movie?.image_url"
            :src="currentAd.movie.image_url"
            :alt="currentAd.movie.name"
            class="vh-100"
            style="object-fit: cover"
          />
          <div v-else class="text-center text-muted">
            <h3>No poster available</h3>
          </div>
        </div>

        <div class="col-lg-8 d-flex flex-column p-4">
          <div class="mb-3">
            <h1 class="display-4 fw-bold mb-2">{{ currentAd.movie?.name }}</h1>
            <div class="d-flex gap-3 mb-3">
              <span class="badge bg-info fs-6">{{ currentAd.movie?.length_minutes }} min</span>
              <span class="badge bg-warning fs-6"
                >⭐ {{ currentAd.movie?.rating?.toFixed(1) }}/10</span
              >
            </div>
            <p class="fs-5">{{ currentAd.movie?.description }}</p>
          </div>

          <div class="mt-auto">
            <h2 class="mb-3">Showing Times Tomorrow</h2>
            <div v-if="currentAd.timeslots && currentAd.timeslots.length > 0" class="row g-2">
              <div
                v-for="timeslot in currentAd.timeslots"
                :key="timeslot.id"
                class="col-md-4 col-lg-3"
              >
                <div class="card bg-primary text-white border-0">
                  <div class="card-body text-center py-3">
                    <h4 class="card-title mb-0">{{ formatTime(timeslot.start_time) }}</h4>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="alert alert-secondary">No showtimes available</div>
          </div>
        </div>
      </div>

      <div class="bg-secondary" style="height: 4px">
        <div
          class="bg-primary h-100 transition-all"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGetAdvertisements } from '@/api/reklame/advertisements/advertisements'
import type { ReklameMovieWithTimeslots } from '@/api/reklame/model'
import { formatTime } from '@/util/time'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const theaterId = computed(() => route.params.theaterId as string)

const { data, isLoading, error } = useGetAdvertisements(theaterId, {
  query: {
    refetchInterval: 60000,
  },
})

const advertisements = computed(() => (data.value || []) as ReklameMovieWithTimeslots[])

const currentIndex = ref(0)
const progressPercent = ref(0)
let rotationTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null

const currentAd = computed(() => {
  if (advertisements.value.length === 0) return null
  return advertisements.value[currentIndex.value]
})

const ROTATION_INTERVAL = 10000
const PROGRESS_INTERVAL = 100

function startRotation() {
  stopRotation()

  if (advertisements.value.length <= 1) return

  progressPercent.value = 0

  rotationTimer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % advertisements.value.length
    progressPercent.value = 0
  }, ROTATION_INTERVAL)

  let elapsed = 0
  progressTimer = setInterval(() => {
    elapsed += PROGRESS_INTERVAL
    progressPercent.value = (elapsed / ROTATION_INTERVAL) * 100
  }, PROGRESS_INTERVAL)
}

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

watch(
  () => advertisements.value.length,
  (newLength) => {
    if (newLength > 0) {
      startRotation()
    } else {
      stopRotation()
    }
  },
)

onMounted(() => {
  if (advertisements.value.length > 0) {
    startRotation()
  }
})

onBeforeUnmount(() => {
  stopRotation()
})
</script>

<style scoped>
.transition-all {
  transition: width 0.1s linear;
}
</style>
