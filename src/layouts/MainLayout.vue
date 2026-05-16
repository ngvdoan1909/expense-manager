<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { BarChart3, LayoutDashboard, LogOut, ReceiptText } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => authStore.user?.displayName || authStore.user?.email || 'Tài khoản')

async function logout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-[#f4f7f4]">
    <aside class="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-stone-200 bg-white lg:block">
      <div class="flex h-16 items-center border-b border-stone-200 px-5">
        <div>
          <p class="text-lg font-bold text-ink">Sổ quỹ</p>
          <p class="text-xs text-stone-500">Quản lý tài chính</p>
        </div>
      </div>

      <nav class="space-y-1 px-3 py-4">
        <RouterLink class="nav-link" :to="{ name: 'dashboard' }">
          <LayoutDashboard class="h-4 w-4" />
          Tổng quan
        </RouterLink>
        <RouterLink class="nav-link" :to="{ name: 'transactions' }">
          <ReceiptText class="h-4 w-4" />
          Giao dịch
        </RouterLink>
        <RouterLink class="nav-link" :to="{ name: 'reports' }">
          <BarChart3 class="h-4 w-4" />
          Báo cáo
        </RouterLink>
      </nav>
    </aside>

    <div class="lg:pl-64">
      <header class="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div class="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-2 lg:hidden">
            <RouterLink class="mobile-link" :to="{ name: 'dashboard' }">Tổng quan</RouterLink>
            <RouterLink class="mobile-link" :to="{ name: 'transactions' }">Giao dịch</RouterLink>
            <RouterLink class="mobile-link" :to="{ name: 'reports' }">Báo cáo</RouterLink>
          </div>

          <div class="ml-auto flex min-w-0 items-center gap-3">
            <span class="hidden truncate text-sm font-medium text-stone-600 sm:block">{{ displayName }}</span>
            <button class="icon-btn" type="button" title="Đăng xuất" @click="logout">
              <LogOut class="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  @apply flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-ink;
}

.nav-link.router-link-exact-active {
  @apply bg-teal-50 text-brand;
}

.mobile-link {
  @apply rounded-md px-2 py-1 text-xs font-semibold text-stone-600;
}

.mobile-link.router-link-exact-active {
  @apply bg-teal-50 text-brand;
}
</style>
