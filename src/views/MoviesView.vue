<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Manage Movies</h1>
      <button class="btn btn-success" @click="showCreateModal">+ Create Movie</button>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading movies...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Error loading movies: {{ error.message }}
    </div>

    <div v-else-if="movies.length === 0" class="alert alert-info">No movies available.</div>

    <div v-else class="row g-3">
      <div v-for="movie in movies" :key="movie.id" class="col-lg-6">
        <div class="card">
          <div class="row g-0">
            <div class="col-4" style="min-height: 200px">
              <img v-if="movie.image_url" :src="movie.image_url" :alt="movie.name" class="img-fluid h-100 w-100"
                style="object-fit: cover" />
            </div>
            <div class="col-8">
              <div class="card-body d-flex flex-column h-100">
                <h5 class="card-title">{{ movie.name }}</h5>
                <p class="card-text text-muted small flex-grow-1">{{ movie.description }}</p>
                <div class="mb-2">
                  <span class="badge bg-info me-1">{{ movie.length_minutes }} min</span>
                  <span class="badge bg-warning">⭐ {{ movie.rating?.toFixed(1) }}/10</span>
                  <span v-if="movie.active" class="badge bg-success ms-1">Active</span>
                  <span v-else class="badge bg-secondary ms-1">Inactive</span>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary flex-fill" @click.stop="showEditModal(movie)">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingMovie ? 'Edit' : 'Create' }} Movie</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div class="row">
                <div class="col-md-8 mb-3">
                  <label class="form-label">Title</label>
                  <input v-model="movieForm.title" type="text" class="form-control" required minlength="3" />
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Active</label>
                  <select v-model="movieForm.active" class="form-select">
                    <option :value="true">Yes</option>
                    <option :value="false">No</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea v-model="movieForm.description" class="form-control" rows="3" required
                  minlength="10"></textarea>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Length (minutes)</label>
                  <input v-model.number="movieForm.length_minutes" type="number" class="form-control" required min="10"
                    max="1000" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Rating (0-10)</label>
                  <input v-model.number="movieForm.rating" type="number" step="any" class="form-control" required
                    min="0" max="10" />
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Image URL</label>
                <input v-model="movieForm.image_url" type="url" class="form-control" required />
                <div v-if="movieForm.image_url" class="mt-2">
                  <img :src="movieForm.image_url" alt="Preview" class="img-thumbnail" style="max-height: 150px" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-secondary" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary"
                  :disabled="createMutation.isPending.value || updateMutation.isPending.value">
                  <span v-if="createMutation.isPending.value || updateMutation.isPending.value"
                    class="spinner-border spinner-border-sm me-1"></span>
                  {{ editingMovie ? 'Save' : 'Create' }}
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
import type { ApiMovieResponse } from '@/api/spored/model';
import { useMoviesCreate, useMoviesList, useMoviesUpdate } from '@/api/spored/movies/movies';
import { computed, ref } from 'vue';

const { data, isLoading, error, refetch } = useMoviesList();

const movies = computed(() => {
  const response = data.value?.data;
  return response || [];
});

const createMutation = useMoviesCreate();
const updateMutation = useMoviesUpdate();

const showModal = ref(false);
const editingMovie = ref<ApiMovieResponse | null>(null);
const movieForm = ref({
  title: '',
  description: '',
  length_minutes: 120,
  rating: 7.0,
  image_url: '',
  active: true,
});

function showCreateModal() {
  editingMovie.value = null;
  movieForm.value = {
    title: '',
    description: '',
    length_minutes: 120,
    rating: 7.0,
    image_url: '',
    active: true,
  };
  showModal.value = true;
}

function showEditModal(movie: ApiMovieResponse) {
  editingMovie.value = movie;
  movieForm.value = {
    title: movie.name || '',
    description: movie.description || '',
    length_minutes: movie.length_minutes || 120,
    rating: movie.rating || 7.0,
    image_url: movie.image_url || '',
    active: movie.active ?? true,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingMovie.value = null;
}

async function handleSave() {
  try {
    if (editingMovie.value) {
      await updateMutation.mutateAsync({
        movieID: editingMovie.value.id!,
        data: movieForm.value,
      });
    } else {
      await createMutation.mutateAsync({ data: movieForm.value });
    }
    await refetch();
    closeModal();
  } catch (error) {
    console.error('Failed to save movie:', error);
    alert('Failed to save movie. Please try again.');
  }
}
</script>
