<script setup>
import { computed } from 'vue'
import { Edit2, Trash2 } from '@lucide/vue'
import { formatPaymentMethod, formatTransactionType } from '@/utils/labels'
import { formatCurrency } from '@/utils/money'

const props = defineProps({
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['edit', 'delete'])
const showActions = computed(() => Boolean(props.onEdit || props.onDelete))

function formatPeriod(row) {
  if (row.periodType === 'monthly') {
    const [year, month] = String(row.periodMonth || row.date?.slice(0, 7) || '').split('-')
    return month && year ? `Tháng ${month}/${year}` : 'Theo tháng'
  }

  return row.date
}
</script>

<template>
  <div class="overflow-hidden rounded-md border border-stone-200 bg-white">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-stone-200">
        <thead class="bg-stone-50">
          <tr>
            <th class="table-head">Kỳ</th>
            <th class="table-head">Loại</th>
            <th class="table-head">Danh mục</th>
            <th class="table-head text-right">Số tiền</th>
            <th class="table-head">Thanh toán</th>
            <th class="table-head">Ghi chú</th>
            <th v-if="showActions" class="table-head text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr v-if="loading">
            <td class="px-4 py-8 text-center text-sm text-stone-500" :colspan="showActions ? 7 : 6">Đang tải dữ liệu...</td>
          </tr>
          <tr v-else-if="!rows.length">
            <td class="px-4 py-8 text-center text-sm text-stone-500" :colspan="showActions ? 7 : 6">Chưa có giao dịch.</td>
          </tr>
          <tr v-for="row in rows" v-else :key="row.id" class="hover:bg-stone-50">
            <td class="table-cell whitespace-nowrap">{{ formatPeriod(row) }}</td>
            <td class="table-cell">
              <span
                class="rounded-full px-2 py-1 text-xs font-semibold"
                :class="row.type === 'income' ? 'bg-teal-50 text-brand' : 'bg-orange-50 text-accent'"
              >
                {{ formatTransactionType(row.type) }}
              </span>
            </td>
            <td class="table-cell font-medium text-ink">{{ row.category }}</td>
            <td class="table-cell text-right font-semibold" :class="row.type === 'income' ? 'text-brand' : 'text-accent'">
              {{ formatCurrency(row.amount) }}
            </td>
            <td class="table-cell whitespace-nowrap">{{ formatPaymentMethod(row.paymentMethod) }}</td>
            <td class="table-cell max-w-xs truncate">{{ row.note || '-' }}</td>
            <td v-if="showActions" class="table-cell">
              <div class="flex justify-end gap-2">
                <button class="icon-btn" type="button" title="Sửa" @click="emit('edit', row)">
                  <Edit2 class="h-4 w-4" />
                </button>
                <button class="icon-btn" type="button" title="Xóa" @click="emit('delete', row)">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-head {
  @apply px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-stone-500;
}

.table-cell {
  @apply px-4 py-3 text-sm text-stone-600;
}
</style>
