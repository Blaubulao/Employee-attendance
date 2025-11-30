import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Daily from '../views/Daily.vue'
import Monthly from '../views/Monthly.vue'
import Employees from '../views/Employees.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', redirect: '/daily' },
      { path: 'daily', component: Daily },
      { path: 'monthly', component: Monthly },
      { path: 'employees', component: Employees }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
