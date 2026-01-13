// MARK_FOR_DELETION: No longer needed - axios instances are now configured in mutator files and set up in main.ts
import axios from 'axios'

export const authAPI = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080',
})

export const nakupAPI = axios.create({
  baseURL: import.meta.env.VITE_NAKUP_API_URL || 'http://localhost:8082',
})

export const sporedAPI = axios.create({
  baseURL: import.meta.env.VITE_SPORED_API_URL || 'http://localhost:8081',
})

export const reklameAPI = axios.create({
  baseURL: import.meta.env.VITE_REKLAME_API_URL || 'http://localhost:8083',
})

// You can add interceptors here if needed
// Example: Add auth token to all requests
// authAPI.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })
