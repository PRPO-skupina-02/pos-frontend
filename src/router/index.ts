import { createRouter, createWebHistory } from 'vue-router'
import POSView from '../views/POSView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'pos',
      component: POSView,
    },
    {
      path: '/timeslot/:theaterId/:roomId/:timeslotId',
      name: 'timeslot-details',
      component: () => import('../views/TimeslotDetailsView.vue'),
    },
    {
      path: '/reservations/:reservationId/purchases',
      name: 'purchases',
      component: () => import('../views/PurchasesView.vue'),
    },
  ],
})

export default router
