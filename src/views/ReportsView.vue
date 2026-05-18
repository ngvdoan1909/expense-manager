<script setup>
import { computed, markRaw, onMounted, reactive, ref, shallowRef } from 'vue'
import StatCard from '@/components/StatCard.vue'
import { useAuthStore } from '@/stores/auth'
import { fetchTransactions } from '@/services/transactionService'
import { formatPaymentMethod, formatTransactionType } from '@/utils/labels'
import { formatCurrency } from '@/utils/money'
import {
  getCurrentDateParts,
  summarizeByCategory,
  summarizeByMonth,
  summarizeByPaymentMethod,
  summarizeTransactions,
} from '@/utils/summary'
import { downloadCsv } from '@/utils/exportCsv'

const authStore = useAuthStore()
const now = getCurrentDateParts()
const rows = ref([])
const yearRows = ref([])
const loading = ref(false)
const error = ref('')
const BarChart = shallowRef(null)
const DoughnutChart = shallowRef(null)
const filters = reactive({
  mode: 'month',
  month: now.month,
  year: now.year,
})

const summary = computed(() => summarizeTransactions(rows.value))
const yearSummary = computed(() => summarizeTransactions(yearRows.value))
const yearlyMonthRows = computed(() => summarizeByMonth(yearRows.value, filters.year))
const categoryRows = computed(() => summarizeByCategory(rows.value))
const expenseRows = computed(() => categoryRows.value.filter((row) => row.type === 'expense'))
const paymentRows = computed(() => summarizeByPaymentMethod(rows.value))

const chartData = computed(() => ({
  labels: expenseRows.value.map((row) => row.category),
  datasets: [
    {
      data: expenseRows.value.map((row) => row.amount),
      backgroundColor: ['#0f766e', '#c2410c', '#2563eb', '#7c2d12', '#4d7c0f', '#9333ea', '#be123c'],
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
}

const paymentChartData = computed(() => ({
  labels: paymentRows.value.map((row) => formatPaymentMethod(row.paymentMethod)),
  datasets: [
    {
      label: 'Thu',
      data: paymentRows.value.map((row) => row.income),
      backgroundColor: '#0f766e',
    },
    {
      label: 'Chi',
      data: paymentRows.value.map((row) => row.expense),
      backgroundColor: '#c2410c',
    },
  ],
}))

const paymentChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' },
  },
  scales: {
    y: { ticks: { callback: (value) => formatCurrency(value) } },
  },
}

const yearlyChartData = computed(() => ({
  labels: yearlyMonthRows.value.map((row) => `Tháng ${row.month}`),
  datasets: [
    {
      label: 'Thu',
      data: yearlyMonthRows.value.map((row) => row.income),
      backgroundColor: '#0f766e',
    },
    {
      label: 'Chi',
      data: yearlyMonthRows.value.map((row) => row.expense),
      backgroundColor: '#c2410c',
    },
    {
      label: 'Lãi',
      data: yearlyMonthRows.value.map((row) => row.profit),
      backgroundColor: '#2563eb',
    },
  ],
}))

const hasYearlyData = computed(() => yearlyMonthRows.value.some((row) => row.count > 0))

function exportReport() {
  downloadCsv(
    `bao-cao-${filters.mode}-${filters.month || 'all'}-${filters.year}.csv`,
    ['Loại', 'Danh mục', 'Số giao dịch', 'Tổng tiền'],
    categoryRows.value.map((row) => [formatTransactionType(row.type), row.category, row.count, row.amount]),
  )
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const uid = authStore.user.uid
    const [periodRows, annualRows] = await Promise.all([
      fetchTransactions(uid, {
        month: filters.mode === 'month' ? filters.month : undefined,
        year: filters.year,
        limit: 5000,
      }),
      fetchTransactions(uid, {
        year: filters.year,
        limit: 5000,
      }),
    ])

    rows.value = periodRows
    yearRows.value = annualRows
  } catch (err) {
    error.value = err.code === 'permission-denied'
      ? 'Bạn chưa có quyền đọc Firestore. Hãy cập nhật Firestore Rules cho đường dẫn users/{uid}.'
      : err.message
    rows.value = []
    yearRows.value = []
  } finally {
    loading.value = false
  }
}

async function loadCharts() {
  const [{ Bar, Doughnut }, chart] = await Promise.all([import('vue-chartjs'), import('chart.js')])
  const { ArcElement, BarElement, CategoryScale, Chart: ChartJS, Legend, LinearScale, Tooltip } = chart
  ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend)
  BarChart.value = markRaw(Bar)
  DoughnutChart.value = markRaw(Doughnut)
}

onMounted(async () => {
  await Promise.all([loadData(), loadCharts()])
})
</script>

<template>
  <div class="space-y-6">
    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <div>
      <h1 class="text-2xl font-bold text-ink">Báo cáo</h1>
      <p class="mt-1 text-sm text-stone-500">Thống kê theo tháng, năm và danh mục.</p>
    </div>

    <section class="rounded-md border border-stone-200 bg-white p-5">
      <div class="grid gap-3 md:grid-cols-[150px_120px_120px_auto]">
        <select v-model="filters.mode" class="form-input">
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
        <input v-model.number="filters.month" class="form-input" :disabled="filters.mode === 'year'" max="12" min="1" type="number" />
        <input v-model.number="filters.year" class="form-input" min="2020" type="number" />
        <div class="flex gap-2">
          <button class="btn-primary" type="button" @click="loadData">Xem báo cáo</button>
          <button class="btn-secondary" type="button" @click="exportReport">Xuất file</button>
        </div>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard title="Tổng thu" :value="formatCurrency(summary.income)" tone="income" />
      <StatCard title="Tổng chi" :value="formatCurrency(summary.expense)" tone="expense" />
      <StatCard title="Lợi nhuận" :value="formatCurrency(summary.profit)" />
    </div>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section class="rounded-md border border-stone-200 bg-white p-5">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-base font-bold text-ink">Theo danh mục</h2>
          <span v-if="loading" class="text-sm text-stone-500">Đang tải...</span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-stone-200">
            <thead>
              <tr>
                <th class="report-head">Loại</th>
                <th class="report-head">Danh mục</th>
                <th class="report-head text-right">Số giao dịch</th>
                <th class="report-head text-right">Tổng tiền</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-if="!categoryRows.length">
                <td class="px-4 py-8 text-center text-sm text-stone-500" colspan="4">Chưa có dữ liệu.</td>
              </tr>
              <tr v-for="row in categoryRows" :key="`${row.type}-${row.category}`">
                <td class="report-cell">{{ formatTransactionType(row.type) }}</td>
                <td class="report-cell font-medium text-ink">{{ row.category }}</td>
                <td class="report-cell text-right">{{ row.count }}</td>
                <td class="report-cell text-right font-semibold">{{ formatCurrency(row.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="rounded-md border border-stone-200 bg-white p-5">
        <h2 class="mb-4 text-base font-bold text-ink">Tỷ trọng chi phí</h2>
        <div class="h-80">
          <component :is="DoughnutChart" v-if="expenseRows.length && DoughnutChart" :data="chartData" :options="chartOptions" />
          <div v-else class="flex h-full items-center justify-center text-sm text-stone-500">Chưa có dữ liệu chi.</div>
        </div>
      </section>
    </div>

    <section class="rounded-md border border-stone-200 bg-white p-5">
      <h2 class="mb-4 text-base font-bold text-ink">Theo phương thức thanh toán</h2>
      <div class="h-80">
        <component :is="BarChart" v-if="paymentRows.length && BarChart" :data="paymentChartData" :options="paymentChartOptions" />
        <div v-else class="flex h-full items-center justify-center text-sm text-stone-500">Chưa có dữ liệu.</div>
      </div>
    </section>

    <div class="grid gap-4 md:grid-cols-3">
      <StatCard title="Thu cả năm" :value="formatCurrency(yearSummary.income)" tone="income" />
      <StatCard title="Chi cả năm" :value="formatCurrency(yearSummary.expense)" tone="expense" />
      <StatCard title="Lãi cả năm" :value="formatCurrency(yearSummary.profit)" />
    </div>

    <section class="rounded-md border border-stone-200 bg-white p-5">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-ink">Thống kê theo năm {{ filters.year }}</h2>
          <p class="text-sm text-stone-500">Tổng hợp thu, chi, lợi nhuận theo từng tháng.</p>
        </div>
        <span v-if="loading" class="text-sm text-stone-500">Đang tải...</span>
      </div>

      <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div class="h-80">
          <component :is="BarChart" v-if="hasYearlyData && BarChart" :data="yearlyChartData" :options="paymentChartOptions" />
          <div v-else class="flex h-full items-center justify-center text-sm text-stone-500">Chưa có dữ liệu năm này.</div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-stone-200">
            <thead>
              <tr>
                <th class="report-head">Tháng</th>
                <th class="report-head text-right">Giao dịch</th>
                <th class="report-head text-right">Thu</th>
                <th class="report-head text-right">Chi</th>
                <th class="report-head text-right">Lãi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100">
              <tr v-for="row in yearlyMonthRows" :key="row.month">
                <td class="report-cell font-medium text-ink">Tháng {{ row.month }}</td>
                <td class="report-cell text-right">{{ row.count }}</td>
                <td class="report-cell text-right text-brand">{{ formatCurrency(row.income) }}</td>
                <td class="report-cell text-right text-accent">{{ formatCurrency(row.expense) }}</td>
                <td class="report-cell text-right font-semibold text-ink">{{ formatCurrency(row.profit) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.report-head {
  @apply px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-stone-500;
}

.report-cell {
  @apply px-4 py-3 text-sm text-stone-600;
}
</style>
