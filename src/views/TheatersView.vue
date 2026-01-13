<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Select Theater</h1>
      <button v-if="isAdmin" class="btn btn-success" @click="showCreateModal">
        + Create Theater
      </button>
    </div>

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
        <div class="card h-100">
          <div class="card-body" role="button" @click="selectTheater(theater.id!)">
            <h5 class="card-title">{{ theater.name }}</h5>
            <p class="card-text text-muted small">
              <small>Created: {{ formatDate(theater.created_at) }}</small>
            </p>
          </div>
          <div v-if="isAdmin" class="card-footer bg-transparent border-top-0 pt-0">
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary flex-fill" @click.stop="showEditModal(theater)">
                Edit
              </button>
              <button class="btn btn-sm btn-outline-danger flex-fill" @click.stop="handleDelete(theater.id!)"
                :disabled="deleteMutation.isPending.value">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingTheater ? 'Edit' : 'Create' }} Theater</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="theaterForm.name" type="text" class="form-control" required minlength="3" />
              </div>
              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary"
                  :disabled="createMutation.isPending.value || updateMutation.isPending.value">
                  <span v-if="createMutation.isPending.value || updateMutation.isPending.value"
                    class="spinner-border spinner-border-sm me-1"></span>
                  {{ editingTheater ? 'Save' : 'Create' }}
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
import type { ApiTheaterResponse } from '@/api/spored/model';
import {
  useTheatersCreate,
  useTheatersDelete,
  useTheatersList,
  useTheatersUpdate,
} from '@/api/spored/theaters/theaters';
import { useAuth } from '@/composables/useAuth';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { isAdmin } = useAuth();

const { data, isLoading, error, refetch } = useTheatersList();

const theaters = computed(() => {
  const response = data.value?.data;
  return response || [];
});

const createMutation = useTheatersCreate();
const updateMutation = useTheatersUpdate();
const deleteMutation = useTheatersDelete();

const showModal = ref(false);
const editingTheater = ref<ApiTheaterResponse | null>(null);
const theaterForm = ref({ name: '' });

function selectTheater(theaterId: string) {
  router.push({ name: 'rooms', params: { theaterId } });
}

function showCreateModal() {
  editingTheater.value = null;
  theaterForm.value = { name: '' };
  showModal.value = true;
}

function showEditModal(theater: ApiTheaterResponse) {
  editingTheater.value = theater;
  theaterForm.value = { name: theater.name || '' };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingTheater.value = null;
}

async function handleSave() {
  try {
    if (editingTheater.value) {
      await updateMutation.mutateAsync({
        theaterID: editingTheater.value.id!,
        data: theaterForm.value,
      });
    } else {
      await createMutation.mutateAsync({ data: theaterForm.value });
    }
    await refetch();
    closeModal();
  } catch (error) {
    console.error('Failed to save theater:', error);
    alert('Failed to save theater. Please try again.');
  }
}

async function handleDelete(theaterId: string) {
  if (!confirm('Are you sure you want to delete this theater? This action cannot be undone.'))
    return;

  try {
    await deleteMutation.mutateAsync({ theaterID: theaterId });
    await refetch();
  } catch (error) {
    console.error('Failed to delete theater:', error);
    alert('Failed to delete theater. Please try again.');
  }
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
