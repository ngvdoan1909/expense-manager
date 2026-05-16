import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/layouts/MainLayout.vue'
import { applySeo } from '@/utils/seo'

const LoginView = () => import('@/views/LoginView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const TransactionsView = () => import('@/views/TransactionsView.vue')
const ReportsView = () => import('@/views/ReportsView.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: {
        title: 'Đăng nhập',
        description: 'Đăng nhập Sổ quỹ để quản lý thu chi, giao dịch và báo cáo tài chính của bạn.',
      },
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
          meta: {
            title: 'Tổng quan',
            description: 'Xem tổng quan thu chi, lợi nhuận, dự báo và sức khỏe tài chính trong Sổ quỹ.',
            robots: 'noindex,nofollow',
          },
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: TransactionsView,
          meta: {
            title: 'Giao dịch',
            description: 'Quản lý danh sách giao dịch thu chi, danh mục và phương thức thanh toán trong Sổ quỹ.',
            robots: 'noindex,nofollow',
          },
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportsView,
          meta: {
            title: 'Báo cáo',
            description: 'Phân tích báo cáo tài chính, cơ cấu thu chi và xu hướng lợi nhuận trong Sổ quỹ.',
            robots: 'noindex,nofollow',
          },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  applySeo(to)

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
