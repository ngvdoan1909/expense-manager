<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import TransactionForm from '@/components/TransactionForm.vue'
import TransactionTable from '@/components/TransactionTable.vue'
import { useAuthStore } from '@/stores/auth'
import {
  createTransaction,
  fetchTransactions,
  removeTransaction,
  updateTransaction,
} from '@/services/transactionService'
import { downloadCsv } from '@/utils/exportCsv'
import { formatPaymentMethod, formatPeriodType, formatTransactionType } from '@/utils/labels'
import { formatCurrency } from '@/utils/money'
import { getCurrentDateParts } from '@/utils/summary'

const authStore = useAuthStore()
const now = getCurrentDateParts()
const rows = ref([])
const loading = ref(false)
const saving = ref(false)
const editing = ref(null)
const error = ref('')
const search = ref('')
const page = ref(1)
const pageSize = 12
const filters = reactive({
  type: '',
  day: '',
  month: now.month,
  year: now.year,
})

const totalPages = computed(() => Math.max(Math.ceil(rows.value.length / pageSize), 1))
const pagedRows = computed(() => rows.value.slice((page.value - 1) * pageSize, page.value * pageSize))
const totalAmount = computed(() =>
  rows.value.reduce((sum, row) => sum + (row.type === 'income' ? Number(row.amount || 0) : -Number(row.amount || 0)), 0),
)

function permissionMessage(err, action) {
  if (err.code === 'permission-denied') {
    return `Bạn chưa có quyền ${action}. Hãy cập nhật Firestore Rules cho đường dẫn users/{uid}.`
  }

  return err.message
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    rows.value = await fetchTransactions(authStore.user.uid, {
      day: filters.day || undefined,
      month: filters.month || undefined,
      year: filters.year || undefined,
      type: filters.type || undefined,
      limit: 200,
    })

    if (search.value.trim()) {
      const keyword = search.value.trim().toLowerCase()
      rows.value = rows.value.filter((row) =>
        [row.category, row.note, row.date, row.periodMonth].some((field) =>
          String(field || '').toLowerCase().includes(keyword),
        ),
      )
    }

    page.value = 1
  } catch (err) {
    error.value = permissionMessage(err, 'đọc giao dịch')
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function save(form) {
  saving.value = true
  error.value = ''

  try {
    if (editing.value) {
      await updateTransaction(authStore.user.uid, editing.value.id, form)
      editing.value = null
    } else {
      await createTransaction(authStore.user.uid, form)
    }
    await loadData()
  } catch (err) {
    error.value = permissionMessage(err, 'lưu giao dịch')
  } finally {
    saving.value = false
  }
}

function edit(row) {
  editing.value = {
    id: row.id,
    type: row.type,
    amount: row.amount,
    periodType: row.periodType || 'daily',
    periodMonth: row.periodMonth || row.date?.slice(0, 7),
    category: row.category,
    paymentMethod: row.paymentMethod || 'cash',
    note: row.note,
    date: row.date,
  }
}

function exportRows() {
  downloadCsv(
    `giao-dich-${filters.month || 'all'}-${filters.year || now.year}.csv`,
    ['Ngày', 'Kiểu ghi nhận', 'Tháng', 'Loại', 'Danh mục', 'Số tiền', 'Thanh toán', 'Ghi chú'],
    rows.value.map((row) => [
      row.date,
      formatPeriodType(row.periodType || 'daily'),
      row.periodMonth || row.date?.slice(0, 7),
      formatTransactionType(row.type),
      row.category,
      row.amount,
      formatPaymentMethod(row.paymentMethod),
      row.note || '',
    ]),
  )
}

async function deleteRow(row) {
  if (!confirm(`Xóa giao dịch "${row.category}"?`)) return
  error.value = ''

  try {
    await removeTransaction(authStore.user.uid, row.id)
    await loadData()
  } catch (err) {
    error.value = permissionMessage(err, 'xóa giao dịch')
  }
}

onMounted(loadData)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-ink">Giao dịch</h1>
      <p class="mt-1 text-sm text-stone-500">Thêm, sửa, xóa và lọc giao dịch theo ngày hoặc tháng.</p>
    </div>

    <TransactionForm :loading="saving" :model-value="editing" @cancel="editing = null" @submit="save" />

    <section class="rounded-md border border-stone-200 bg-white p-5">
      <div class="grid gap-3 md:grid-cols-[1fr_130px_120px_120px_120px_auto_auto]">
        <input v-model="search" class="form-input" placeholder="Tìm danh mục, ghi chú, kỳ" type="search" />
        <select v-model="filters.type" class="form-input">
          <option value="">Tất cả</option>
          <option value="income">Thu</option>
          <option value="expense">Chi</option>
        </select>
        <input v-model.number="filters.day" class="form-input" max="31" min="1" placeholder="Ngày" type="number" />
        <input v-model.number="filters.month" class="form-input" max="12" min="1" placeholder="Tháng" type="number" />
        <input v-model.number="filters.year" class="form-input" min="2020" placeholder="Năm" type="number" />
        <button class="btn-primary" type="button" @click="loadData">Lọc</button>
        <button class="btn-secondary" type="button" @click="exportRows">Xuất file</button>
      </div>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <span>{{ rows.length }} giao dịch</span>
        <span>Số dư lọc: <strong class="text-ink">{{ formatCurrency(totalAmount) }}</strong></span>
      </div>
    </section>

    <div v-if="error" class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      {{ error }}
    </div>

    <TransactionTable :loading="loading" :rows="pagedRows" @delete="deleteRow" @edit="edit" />

    <div class="flex items-center justify-end gap-2">
      <button class="btn-secondary" :disabled="page <= 1" type="button" @click="page -= 1">Trước</button>
      <span class="text-sm font-semibold text-stone-600">Trang {{ page }} / {{ totalPages }}</span>
      <button class="btn-secondary" :disabled="page >= totalPages" type="button" @click="page += 1">Sau</button>
    </div>
  </div>
</template>
