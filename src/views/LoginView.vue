<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const mode = ref('login')
const email = ref('')
const password = ref('')
const error = ref('')

async function submit() {
  error.value = ''
  try {
    if (mode.value === 'login') {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value)
    }
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message
  }
}

async function googleLogin() {
  error.value = ''
  try {
    await authStore.loginWithGoogle()
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <main class="grid min-h-screen bg-[#f4f7f4] lg:grid-cols-[1fr_440px]">
    <section class="flex items-center px-6 py-12 sm:px-10 lg:px-16">
      <div class="max-w-2xl">
        <h1 class="mt-4 text-4xl font-bold text-ink sm:text-5xl">Sổ quỹ</h1>
        <p class="mt-5 max-w-xl text-base leading-7 text-stone-600">
          Theo dõi thu, chi, lợi nhuận và báo cáo danh mục cho cửa hàng nhỏ hoặc tài chính cá nhân.
        </p>
      </div>
    </section>

    <section class="flex items-center border-l border-stone-200 bg-white px-6 py-10">
      <div class="mx-auto w-full max-w-sm">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-ink">{{ mode === 'login' ? 'Đăng nhập' : 'Đăng ký' }}</h2>
          <p class="mt-1 text-sm text-stone-500">Sử dụng email, mật khẩu hoặc xác thực Google.</p>
        </div>

        <div v-if="authStore.configMissing" class="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Chưa có cấu hình Firebase. Tạo file .env từ .env.example và điền VITE_FIREBASE_*.
        </div>

        <form class="space-y-4" @submit.prevent="submit">
          <label class="space-y-1">
            <span class="text-sm font-semibold text-stone-600">Email</span>
            <input v-model="email" class="form-input" required type="email" />
          </label>

          <label class="space-y-1">
            <span class="text-sm font-semibold text-stone-600">Mật khẩu</span>
            <input v-model="password" class="form-input" minlength="6" required type="password" />
          </label>

          <p v-if="error || authStore.error" class="text-sm text-red-600">{{ error || authStore.error }}</p>

          <button class="btn-primary w-full" :disabled="authStore.loading || authStore.configMissing" type="submit">
            <LogIn class="h-4 w-4" />
            {{ mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản' }}
          </button>
        </form>

        <button
          class="btn-secondary mt-3 w-full"
          :disabled="authStore.loading || authStore.configMissing"
          type="button"
          @click="googleLogin"
        >
          Đăng nhập Google
        </button>

        <button
          class="mt-5 w-full text-center text-sm font-semibold text-brand"
          type="button"
          @click="mode = mode === 'login' ? 'register' : 'login'"
        >
          {{ mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập' }}
        </button>
      </div>
    </section>
  </main>
</template>
