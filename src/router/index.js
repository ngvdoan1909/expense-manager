import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'

const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const TransactionsView = () => import('@/views/TransactionsView.vue')
const ReportsView = () => import('@/views/ReportsView.vue')

const APP_NAME = 'Sổ quỹ'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { title: 'Đăng nhập' } },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', name: 'dashboard', component: DashboardView, meta: { title: 'Tổng quan' } },
        { path: 'transactions', name: 'transactions', component: TransactionsView, meta: { title: 'Giao dịch' } },
        { path: 'reports', name: 'reports', component: ReportsView, meta: { title: 'Báo cáo' } },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  document.title = to.meta.title ? `${to.meta.title} - ${APP_NAME}` : APP_NAME

  const authStore = useAuthStore()
  if (!authStore.ready) {
    await authStore.init()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.user) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
