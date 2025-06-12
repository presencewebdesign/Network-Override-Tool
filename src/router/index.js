import { createRouter, createWebHistory } from 'vue-router'
import WidgetView from '../views/WidgetView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: WidgetView,
    },
    {
      path: '/embedded',
      name: 'embedded',
      component: () => import('../views/EmbeddedView.vue'),
    },
    {
      path: '/widget',
      name: 'widget',
      component: () => import('../views/WidgetView.vue'),
    },
    {
      path: '/home',
      name: 'original-home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
