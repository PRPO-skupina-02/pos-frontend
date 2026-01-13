<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">CineCore POS</router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul v-if="isAdmin" class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/movies" class="nav-link">Movies</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/users" class="nav-link">Users</router-link>
          </li>
        </ul>

        <div v-if="navigationState" class="navbar-text text-light d-none d-lg-block me-auto">
          <span v-if="navigationState.theater" class="me-2">
            <span class="badge bg-secondary ms-1">{{ navigationState.theater }}</span>
          </span>
          <span v-if="navigationState.room" class="me-2">
            <span class="badge bg-secondary ms-1">{{ navigationState.room }}</span>
          </span>
          <span v-if="navigationState.timeslot">
            <span class="badge bg-secondary ms-1">{{ navigationState.timeslot }}</span>
          </span>
        </div>

        <div v-if="isAuthenticated" class="d-flex align-items-center ms-auto">
          <span class="text-light me-3">
            <small>{{ user?.first_name || user?.email }}</small>
            <span class="badge isAdmin, bg-primary ms-1">{{ user?.role }}</span>
          </span>
          <button class="btn btn-outline-light btn-sm" @click="logout">Logout</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { roomsShow } from '@/api/spored/rooms/rooms'
import { theatersShow } from '@/api/spored/theaters/theaters'
import { timeSlotsShow } from '@/api/spored/timeslots/timeslots'
import { useAuth } from '@/composables/useAuth'
import { formatTime } from '@/util/time'
import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const { user, isAuthenticated, isAdmin, logout } = useAuth()

const theaterId = computed(() => route.params.theaterId as string | undefined)
const roomId = computed(() => route.params.roomId as string | undefined)
const timeslotId = computed(() => route.params.timeslotId as string | undefined)

const { data: theaterData } = useQuery({
  queryKey: ['theater', theaterId],
  queryFn: () => theatersShow(theaterId.value!),
  enabled: computed(() => !!theaterId.value),
})

const { data: roomData } = useQuery({
  queryKey: ['room', theaterId, roomId],
  queryFn: () => roomsShow(theaterId.value!, roomId.value!),
  enabled: computed(() => !!(theaterId.value && roomId.value)),
})

const { data: timeslotData } = useQuery({
  queryKey: ['timeslot', theaterId, roomId, timeslotId],
  queryFn: () => timeSlotsShow(theaterId.value!, roomId.value!, timeslotId.value!),
  enabled: computed(() => !!(theaterId.value && roomId.value && timeslotId.value)),
})

const navigationState = computed(() => {
  return {
    theater: theaterId.value ? theaterData.value?.name : undefined,
    room: roomId.value ? roomData.value?.name : undefined,
    timeslot: timeslotId.value ? formatTime(timeslotData.value?.start_time || '') : undefined,
  }
})
</script>
