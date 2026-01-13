import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/main.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { authAPI } from './api/auth-mutator'
import { nakupAPI } from './api/nakup-mutator'
import { reklameAPI } from './api/reklame-mutator'
import { sporedAPI } from './api/spored-mutator'

authAPI.defaults.baseURL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:8080'
nakupAPI.defaults.baseURL = import.meta.env.VITE_NAKUP_API_URL || 'http://localhost:8082'
sporedAPI.defaults.baseURL = import.meta.env.VITE_SPORED_API_URL || 'http://localhost:8081'
reklameAPI.defaults.baseURL = import.meta.env.VITE_REKLAME_API_URL || 'http://localhost:8083'

const TOKEN_KEY = 'auth_token'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const authInterceptor = (config: any) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

authAPI.interceptors.request.use(authInterceptor)
nakupAPI.interceptors.request.use(authInterceptor)
sporedAPI.interceptors.request.use(authInterceptor)
reklameAPI.interceptors.request.use(authInterceptor)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const responseErrorInterceptor = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('refresh_token')
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' })
    }
  }
  return Promise.reject(error)
}

authAPI.interceptors.response.use((response) => response, responseErrorInterceptor)
nakupAPI.interceptors.response.use((response) => response, responseErrorInterceptor)
sporedAPI.interceptors.response.use((response) => response, responseErrorInterceptor)
reklameAPI.interceptors.response.use((response) => response, responseErrorInterceptor)

const app = createApp(App)

app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
