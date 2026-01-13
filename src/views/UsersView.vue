<template>
  <div class="container-fluid py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Manage Users</h1>
      <button class="btn btn-success" @click="showCreateModal">+ Create User</button>
    </div>

    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading users...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">Error loading users: {{ error.message }}</div>

    <div v-else-if="users.length === 0" class="alert alert-info">No users available.</div>

    <div v-else class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.first_name }} {{ user.last_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="badge bg-primary">{{ user.role }}</span>
            </td>
            <td>
              <span v-if="user.active" class="badge bg-success">Active</span>
              <span v-else class="badge bg-secondary">Inactive</span>
            </td>
            <td>
              <small class="text-muted">{{ formatDate(user.created_at) }}</small>
            </td>
            <td>
              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-primary" @click="showEditModal(user)">
                  Edit
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="handleDelete(user.id!)"
                  :disabled="deleteMutation.isPending.value"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal show d-block" tabindex="-1" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingUser ? 'Edit' : 'Create' }} User</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <div v-if="!editingUser" class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="userForm.email" type="email" class="form-control" required />
              </div>

              <div v-if="!editingUser" class="mb-3">
                <label class="form-label">Password</label>
                <input
                  v-model="userForm.password"
                  type="password"
                  class="form-control"
                  required
                  minlength="8"
                />
                <small class="form-text text-muted">Minimum 8 characters</small>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">First Name</label>
                  <input
                    v-model="userForm.first_name"
                    type="text"
                    class="form-control"
                    minlength="1"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Last Name</label>
                  <input
                    v-model="userForm.last_name"
                    type="text"
                    class="form-control"
                    minlength="1"
                  />
                </div>
              </div>

              <div v-if="!editingUser" class="mb-3">
                <label class="form-label">Role</label>
                <select v-model="userForm.role" class="form-select" required>
                  <option :value="ApiAdminCreateUserRequestRole.customer">Customer</option>
                  <option :value="ApiAdminCreateUserRequestRole.employee">Employee</option>
                  <option :value="ApiAdminCreateUserRequestRole.admin">Admin</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Status</label>
                <select v-model="userForm.active" class="form-select">
                  <option :value="true">Active</option>
                  <option :value="false">Inactive</option>
                </select>
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
                  {{ editingUser ? 'Save' : 'Create' }}
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
import { ApiAdminCreateUserRequestRole, type ApiUserResponse } from '@/api/auth/model'
import {
  useAdminCreateUser,
  useUsersDelete,
  useUsersList,
  useUsersUpdate,
} from '@/api/auth/users/users'
import { computed, ref } from 'vue'

const { data, isLoading, error, refetch } = useUsersList()

const users = computed(() => {
  return (data.value?.data || []) as ApiUserResponse[]
})

const createMutation = useAdminCreateUser()
const updateMutation = useUsersUpdate()
const deleteMutation = useUsersDelete()

const showModal = ref(false)
const editingUser = ref<ApiUserResponse | null>(null)
const userForm = ref<{
  email: string
  password: string
  first_name: string
  last_name: string
  role: ApiAdminCreateUserRequestRole
  active: boolean
}>({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: ApiAdminCreateUserRequestRole.customer,
  active: true,
})

function showCreateModal() {
  editingUser.value = null
  userForm.value = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: ApiAdminCreateUserRequestRole.customer,
    active: true,
  }
  showModal.value = true
}

function showEditModal(user: ApiUserResponse) {
  editingUser.value = user
  userForm.value = {
    email: user.email || '',
    password: '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: (user.role as ApiAdminCreateUserRequestRole) || ApiAdminCreateUserRequestRole.customer,
    active: user.active ?? true,
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function handleSave() {
  try {
    if (editingUser.value) {
      await updateMutation.mutateAsync({
        userID: editingUser.value.id!,
        data: {
          first_name: userForm.value.first_name,
          last_name: userForm.value.last_name,
          active: userForm.value.active,
        },
      })
    } else {
      await createMutation.mutateAsync({
        data: {
          email: userForm.value.email,
          password: userForm.value.password,
          first_name: userForm.value.first_name,
          last_name: userForm.value.last_name,
          role: userForm.value.role,
          active: userForm.value.active,
        },
      })
    }
    await refetch()
    closeModal()
  } catch (error) {
    console.error('Failed to save user:', error)
    alert('Failed to save user. Please try again.')
  }
}

async function handleDelete(userId: string) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

  try {
    await deleteMutation.mutateAsync({ userID: userId })
    await refetch()
  } catch (error) {
    console.error('Failed to delete user:', error)
    alert('Failed to delete user. Please try again.')
  }
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}
</script>
