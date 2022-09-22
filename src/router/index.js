import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import Detail from '@/views/Detail.vue'
import AddAlbum from '@/views/AddAlbum.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/:albumId',
      component: Detail,
    },
    {
      path: '/addAlbum',
      component: AddAlbum,
    }
  ],
})

export default router
