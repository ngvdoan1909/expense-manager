<script setup>
import { computed, markRaw, onMounted, ref, shallowRef } from 'vue'
import StatCard from '@/components/StatCard.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { useAuthStore } from '@/stores/auth'
import { fetchTransactions } from '@/services/transactionService'
import { formatPaymentMethod } from '@/utils/labels'
import { formatCurrency } from '@/utils/money'
import {
  buildCutSuggestions,
  calculateFinancialHealth,
  comparePeriods,
  detectAnomalies,
  forecastEndOfMonth,
  getPreviousMonth,
} from '@/utils/insights'
import {
  calculateDailyAverage,
  findTopExpenseCategory,
  getCurrentDateParts,
  summarizeByPaymentMethod,
  summarizeTransactions,
} from '@/utils/summary'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref('')
const monthRows = ref([])
const previousMonthRows = ref([])
const BarChart = shallowRef(null)
const now = getCurrentDateParts()
const previousPeriod = getPreviousMonth(now.month, now.year)

const todayRows = computed(() => monthRows.value.filter((row) => Number(row.day) === now.day))
const todaySummary = computed(() => summarizeTransactions(todayRows.value))
const monthSummary = computed(() => summarizeTransactions(monthRows.value))
const recentRows = computed(() => monthRows.value.slice(0, 8))
const dailyAverage = computed(() => calculateDailyAverage(monthRows.value, now.day))
const topExpense = computed(() => findTopExpenseCategory(monthRows.value))
const paymentRows = computed(() => summarizeByPaymentMethod(monthRows.value).slice(0, 4))
const forecast = computed(() => forecastEndOfMonth(monthRows.value, now.month, now.year, now.day))
const periodComparison = computed(() => comparePeriods(monthRows.value, previousMonthRows.value))
const anomalies = computed(() => detectAnomalies(monthRows.value, previousMonthRows.value))
const health = computed(() => calculateFinancialHealth(monthRows.value))
const suggestions = computed(() => buildCutSuggestions(monthRows.value, previousMonthRows.value))

const chartData = computed(() => {
  const days = new Map()
  monthRows.value.forEach((row) => {
    const current = days.get(row.day) || { income: 0, expense: 0 }
    current[row.type] += Number(row.amount || 0)
    days.set(row.day, current)
  })

  const labels = [...days.keys()].sort((a, b) => a - b)

  return {
    labels: labels.map((day) => `Ngày ${day}`),
    datasets: [
      {
        label: 'Thu',
        data: labels.map((day) => days.get(day).income),
        backgroundColor: '#0f766e',
      },
      {
        label: 'Chi',
        data: labels.map((day) => days.get(day).expense),
        backgroundColor: '#c2410c',
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
  scales: {
    y: { ticks: { callback: (value) => formatCurrency(value) } },
  },
}

function formatPercent(value) {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${Math.round(value)}%`
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    const uid = authStore.user.uid
    const [month, previousMonth] = await Promise.all([
      fetchTransactions(uid, { month: now.month, year: now.year, limit: 500 }),
      fetchTransactions(uid, { month: previousPeriod.month, year: previousPeriod.year, limit: 500 }),
    ])
    monthRows.value = month
    previousMonthRows.value = previousMonth
  } catch (err) {
    error.value = err.code === 'permission-denied'
      ? 'Bạn chưa có quyền đọc Firestore. Hãy cập nhật Firestore Rules cho đường dẫn users/{uid}.'
      : err.message
    monthRows.value = []
    previousMonthRows.value = []
  } finally {
    loading.value = false
  }
}

async function loadChart() {
  const [{ Bar }, chart] = await Promise.all([import('vue-chartjs'), import('chart.js')])
  const { BarElement, CategoryScale, Chart: ChartJS, Legend, LinearScale, Tooltip } = chart
  ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)
  BarChart.value = markRaw(Bar)
}

onMounted(async () => {
  await Promise.all([loadData(), loadChart()])
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div>
      <h1 class="text-2xl font-bold text-ink">Tổng quan</h1>
      <p class="mt-1 text-sm text-stone-500">Tổng hợp hôm nay và tháng {{ now.month }}/{{ now.year }}.</p>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard title="Thu hôm nay" :value="formatCurrency(todaySummary.income)" tone="income" />
      <StatCard title="Chi hôm nay" :value="formatCurrency(todaySummary.expense)" tone="expense" />
      <StatCard title="Lãi hôm nay" :value="formatCurrency(todaySummary.profit)" />
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard title="Thu tháng" :value="formatCurrency(monthSummary.income)" tone="income" />
      <StatCard title="Chi tháng" :value="formatCurrency(monthSummary.expense)" tone="expense" />
      <StatCard title="Lãi tháng" :value="formatCurrency(monthSummary.profit)" />
    </div>

    <section class="rounded-md border border-stone-200 bg-white p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-ink">Tài chính thông minh</h2>
          <p class="text-sm text-stone-500">Dự báo, cảnh báo và điểm sức khỏe dựa trên dữ liệu tháng này.</p>
        </div>
        <div class="rounded-md border border-stone-200 px-4 py-2 text-right">
          <p class="text-xs font-semibold uppercase tracking-normal text-stone-500">Điểm sức khỏe</p>
          <p class="text-2xl font-bold text-brand">{{ health.score }}/100</p>
          <p class="text-xs text-stone-500">{{ health.label }}</p>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div class="rounded-md border border-stone-200 p-4">
          <p class="text-sm font-semibold text-stone-500">Dự báo cuối tháng</p>
          <p class="mt-2 text-xl font-bold text-ink">{{ formatCurrency(forecast.profit) }}</p>
          <p class="mt-1 text-sm text-stone-500">
            Thu {{ formatCurrency(forecast.income) }}, chi {{ formatCurrency(forecast.expense) }} nếu giữ tốc độ hiện tại.
          </p>
        </div>

        <div class="rounded-md border border-stone-200 p-4">
          <p class="text-sm font-semibold text-stone-500">So với tháng trước</p>
          <p class="mt-2 text-sm text-stone-600">Thu: <strong>{{ formatPercent(periodComparison.incomeChange) }}</strong></p>
          <p class="mt-1 text-sm text-stone-600">Chi: <strong>{{ formatPercent(periodComparison.expenseChange) }}</strong></p>
          <p class="mt-1 text-sm text-stone-600">Lãi: <strong>{{ formatPercent(periodComparison.profitChange) }}</strong></p>
        </div>
      </div>
    </section>

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section class="rounded-md border border-stone-200 bg-white p-5">
        <div class="mb-4 flex items-center justify-between gap-3">
          <h2 class="text-base font-bold text-ink">Biểu đồ doanh thu</h2>
          <span v-if="loading" class="text-sm text-stone-500">Đang tải...</span>
        </div>
        <div class="h-80">
          <component :is="BarChart" v-if="monthRows.length && BarChart" :data="chartData" :options="chartOptions" />
          <div v-else class="flex h-full items-center justify-center text-sm text-stone-500">Chưa có dữ liệu tháng này.</div>
        </div>
      </section>

      <section class="rounded-md border border-stone-200 bg-white p-5">
        <h2 class="mb-4 text-base font-bold text-ink">Phương thức thanh toán</h2>
        <div v-if="!paymentRows.length" class="text-sm text-stone-500">Chưa có dữ liệu.</div>
        <div v-else class="space-y-3">
          <div v-for="row in paymentRows" :key="row.paymentMethod" class="rounded-md border border-stone-200 p-3">
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold text-ink">{{ formatPaymentMethod(row.paymentMethod) }}</p>
              <p class="text-xs text-stone-500">{{ row.count }} giao dịch</p>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
              <span class="text-brand">{{ formatCurrency(row.income) }}</span>
              <span class="text-right text-accent">{{ formatCurrency(row.expense) }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <section class="rounded-md border border-stone-200 bg-white p-5">
        <h2 class="mb-4 text-base font-bold text-ink">Cảnh báo bất thường</h2>
        <div v-if="!anomalies.length" class="text-sm text-stone-500">Chưa phát hiện khoản chi tăng bất thường.</div>
        <div v-else class="space-y-3">
          <div v-for="row in anomalies" :key="row.category" class="rounded-md border border-orange-200 bg-orange-50 p-3">
            <p class="font-semibold text-accent">{{ row.category }} tăng {{ formatPercent(row.change) }}</p>
            <p class="mt-1 text-sm text-stone-600">
              Tháng này {{ formatCurrency(row.amount) }}, tháng trước {{ formatCurrency(row.previousAmount) }}.
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-md border border-stone-200 bg-white p-5">
        <h2 class="mb-4 text-base font-bold text-ink">Gợi ý cắt giảm</h2>
        <div v-if="!suggestions.length" class="text-sm text-stone-500">Chi tiêu đang ổn, chưa có gợi ý cắt giảm rõ ràng.</div>
        <div v-else class="space-y-3">
          <div v-for="item in suggestions" :key="item.title" class="rounded-md border border-stone-200 p-3">
            <p class="font-semibold text-ink">{{ item.title }}</p>
            <p class="mt-1 text-sm text-stone-600">{{ item.detail }}</p>
          </div>
        </div>
      </section>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard title="Thu TB/ngày" :value="formatCurrency(dailyAverage.income)" tone="income" />
      <StatCard title="Chi TB/ngày" :value="formatCurrency(dailyAverage.expense)" tone="expense" />
      <StatCard
        title="Chi phí lớn nhất"
        :value="topExpense ? `${topExpense.category}: ${formatCurrency(topExpense.amount)}` : 'Chưa có'"
      />
    </div>

    <section class="space-y-3">
      <h2 class="text-base font-bold text-ink">Giao dịch gần đây</h2>
      <TransactionTable :loading="loading" :rows="recentRows" />
    </section>
  </div>
</template>
