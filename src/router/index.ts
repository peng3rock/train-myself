import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/goal/:id',
    name: 'goal-detail',
    component: () => import('../views/GoalDetail.vue'),
    props: true
  }
]

const router = createRouter({
  history: createWebHistory('/train-myself/'),
  routes
})

export default router
