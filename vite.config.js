import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

const fallbackSiteUrl = 'https://so-quy.vercel.app'

function normalizeSiteUrl(value) {
  if (!value) return fallbackSiteUrl

  const withProtocol = value.startsWith('http') ? value : `https://${value}`
  return withProtocol.replace(/\/$/, '')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = normalizeSiteUrl(
    env.VITE_SITE_URL || env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL,
  )

  return {
    plugins: [
      vue(),
      {
        name: 'inject-seo-site-url',
        transformIndexHtml(html) {
          return html.replaceAll('__SITE_URL__', siteUrl)
        },
      },
    ],
    define: {
      'import.meta.env.VITE_SITE_URL': JSON.stringify(siteUrl),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            firebaseAuth: ['firebase/app', 'firebase/auth'],
            firebaseStore: ['firebase/firestore'],
            charts: ['chart.js', 'vue-chartjs'],
            icons: ['@lucide/vue'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
