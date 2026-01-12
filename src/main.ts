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

const app = createApp(App)

app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
