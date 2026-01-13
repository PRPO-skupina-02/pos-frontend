import { createRouter, createWebHistory } from 'vue-router';
import TheatersView from '../views/TheatersView.vue';

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
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('auth_token')
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !token) {
    next({ name: 'login' })
  } else if (to.name === 'login' && token) {
    next({ name: 'theaters' })
  } else {
    next()
  }
})

export default router
