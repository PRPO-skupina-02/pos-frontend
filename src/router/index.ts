import { createRouter, createWebHistory } from 'vue-router';
import TheatersView from '../views/TheatersView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'theaters',
      component: TheatersView,
    },
    {
      path: '/theaters/:theaterId/rooms',
      name: 'rooms',
      component: () => import('../views/RoomsView.vue'),
    },
    {
      path: '/theaters/:theaterId/rooms/:roomId/timeslots',
      name: 'timeslots',
      component: () => import('../views/TimeslotsView.vue'),
    },
    {
      path: '/reservations/:reservationId/purchases',
      name: 'purchases',
      component: () => import('../views/PurchasesView.vue'),
    },
  ],
})

export default router
