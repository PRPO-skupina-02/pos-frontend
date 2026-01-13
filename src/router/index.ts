import { createRouter, createWebHistory } from 'vue-router'
import TheatersView from '../views/TheatersView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/advertising/:theaterId',
      name: 'advertising',
      component: () => import('../views/AdvertisingView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'theaters',
      component: TheatersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/theaters/:theaterId/rooms',
      name: 'rooms',
      component: () => import('../views/RoomsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/theaters/:theaterId/rooms/:roomId/timeslots',
      name: 'timeslots',
      component: () => import('../views/TimeslotsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/theaters/:theaterId/rooms/:roomId/timeslots/:timeslotId',
      name: 'timeslot-details',
      component: () => import('../views/TimeslotDetailsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservations/:reservationId/purchases',
      name: 'purchases',
      component: () => import('../views/PurchasesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/movies',
      name: 'movies',
      component: () => import('../views/MoviesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const requiresAuth = to.meta.requiresAuth !== false
  const requiresAdmin = to.meta.requiresAdmin === true

  if (requiresAuth && !token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    next({ name: 'theaters' })
  } else if (requiresAdmin) {
    // For admin routes, we need to check the user's role
    // We'll rely on the API to enforce this and show an error if unauthorized
    // The navbar will only show these links to admins anyway
    next()
  } else {
    next()
  }
})

export default router
