<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Select Room</h1>
      <div class="d-flex gap-2">
        <button v-if="isAdmin" class="btn btn-success" @click="showCreateModal">
          + Create Room
        </button>
        <router-link to="/" class="btn btn-outline-secondary"> ← Back to Theaters </router-link>
      </div>
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
        <div class="card h-100">
          <div class="card-body room-card" role="button" @click="selectRoom(room.id!)">
            <h5 class="card-title">{{ room.name }}</h5>
            <div class="text-muted small">
              <div class="mb-2">
                <strong>Capacity:</strong> {{ (room.rows || 0) * (room.columns || 0) }} seats
              </div>
              <div class="mb-2">
                <strong>Layout:</strong> {{ room.rows }} rows × {{ room.columns }} columns
              </div>
              <div class="mb-2">
                <strong>Hours:</strong> {{ room.opening_hour }}:00 - {{ room.closing_hour }}:00
              </div>
              <div v-if="room.operating_mode"><strong>Mode:</strong> {{ room.operating_mode }}</div>
            </div>
          </div>
          <div v-if="isAdmin" class="card-footer bg-transparent border-top-0 pt-0">
            <div class="d-flex gap-2">
              <button
                class="btn btn-sm btn-outline-primary flex-fill"
                @click.stop="showEditModal(room)"
              >
                Edit
              </button>
              <button
                class="btn btn-sm btn-outline-danger flex-fill"
                @click.stop="handleDelete(room.id!)"
                :disabled="deleteMutation.isPending.value"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingRoom ? 'Edit' : 'Create' }} Room</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Name</label>
                  <input
                    v-model="roomForm.name"
                    type="text"
                    class="form-control"
                    required
                    minlength="3"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Operating Mode</label>
                  <select v-model="roomForm.operating_mode" class="form-select" required>
                    <option :value="ApiRoomRequestOperatingMode.ALL">All Days</option>
                    <option :value="ApiRoomRequestOperatingMode.WEEKDAYS">Weekdays Only</option>
                    <option :value="ApiRoomRequestOperatingMode.WEEKENDS">Weekends Only</option>
                    <option :value="ApiRoomRequestOperatingMode.CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Rows</label>
                  <input
                    v-model.number="roomForm.rows"
                    type="number"
                    class="form-control"
                    required
                    min="1"
                    max="100"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Columns</label>
                  <input
                    v-model.number="roomForm.columns"
                    type="number"
                    class="form-control"
                    required
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Opening Hour (0-24)</label>
                  <input
                    v-model.number="roomForm.opening_hour"
                    type="number"
                    class="form-control"
                    required
                    min="0"
                    max="24"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Closing Hour (0-24)</label>
                  <input
                    v-model.number="roomForm.closing_hour"
                    type="number"
                    class="form-control"
                    required
                    min="0"
                    max="24"
                  />
                </div>
              </div>

              <div class="alert alert-info">
                <strong>Total Capacity:</strong> {{ roomForm.rows * roomForm.columns }} seats
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="createMutation.isPending.value || updateMutation.isPending.value"
                >
                  <span
                    v-if="createMutation.isPending.value || updateMutation.isPending.value"
                    class="spinner-border spinner-border-sm me-1"
                  ></span>
                  {{ editingRoom ? 'Save' : 'Create' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-backdrop show"></div>
  </div>
</template>

<script setup lang="ts">
import { ApiRoomRequestOperatingMode, type ApiRoomResponse } from '@/api/spored/model'
import {
  useRoomsCreate,
  useRoomsDelete,
  useRoomsList,
  useRoomsUpdate,
} from '@/api/spored/rooms/rooms'
import { useAuth } from '@/composables/useAuth'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

const theaterId = computed(() => route.params.theaterId as string)

const { data, isLoading, error, refetch } = useRoomsList(theaterId)

const rooms = computed(() => {
  const response = data.value?.data
  return response || []
})

const createMutation = useRoomsCreate()
const updateMutation = useRoomsUpdate()
const deleteMutation = useRoomsDelete()

const showModal = ref(false)
const editingRoom = ref<ApiRoomResponse | null>(null)
const roomForm = ref({
  name: '',
  rows: 10,
  columns: 10,
  opening_hour: 9,
  closing_hour: 23,
  operating_mode: ApiRoomRequestOperatingMode.ALL,
})

function selectRoom(roomId: string) {
  router.push({
    name: 'timeslots',
    params: {
      theaterId: theaterId.value,
      roomId,
    },
  })
}

function showCreateModal() {
  editingRoom.value = null
  roomForm.value = {
    name: '',
    rows: 10,
    columns: 10,
    opening_hour: 9,
    closing_hour: 23,
    operating_mode: ApiRoomRequestOperatingMode.ALL,
  }
  showModal.value = true
}

function showEditModal(room: ApiRoomResponse) {
  editingRoom.value = room
  roomForm.value = {
    name: room.name || '',
    rows: room.rows || 10,
    columns: room.columns || 10,
    opening_hour: room.opening_hour || 9,
    closing_hour: room.closing_hour || 23,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    operating_mode: (room.operating_mode as any) || ApiRoomRequestOperatingMode.ALL,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingRoom.value = null
}

async function handleSave() {
  try {
    if (editingRoom.value) {
      await updateMutation.mutateAsync({
        theaterID: theaterId.value,
        roomID: editingRoom.value.id!,
        data: roomForm.value,
      })
    } else {
      await createMutation.mutateAsync({
        theaterID: theaterId.value,
        data: roomForm.value,
      })
    }
    await refetch()
    closeModal()
  } catch (error) {
    console.error('Failed to save room:', error)
    alert('Failed to save room. Please try again.')
  }
}

async function handleDelete(roomId: string) {
  if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) return

  try {
    await deleteMutation.mutateAsync({
      theaterID: theaterId.value,
      roomID: roomId,
    })
    await refetch()
  } catch (error) {
    console.error('Failed to delete room:', error)
    alert('Failed to delete room. Please try again.')
  }
}
</script>
