<script setup>
import { computed, reactive, watch } from 'vue'
import { Save } from '@lucide/vue'
import { categoriesByType } from '@/constants/categories'
import { getCurrentDateParts } from '@/utils/summary'

const props = defineProps({
  modelValue: { type: Object, default: null },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit', 'cancel'])
const now = getCurrentDateParts()

const emptyForm = () => ({
  type: 'income',
  periodType: 'daily',
  amount: '',
  category: categoriesByType('income')[0],
  paymentMethod: 'bank',
  note: '',
  date: now.date,
  periodMonth: now.date.slice(0, 7),
})

const form = reactive(emptyForm())
const categoryOptions = computed(() => categoriesByType(form.type))

watch(
  () => props.modelValue,
  (value) => {
    Object.assign(form, value || emptyForm())
    if (!form.periodMonth && form.date) form.periodMonth = form.date.slice(0, 7)
  },
  { immediate: true },
)

watch(
  () => form.type,
  () => {
    if (!categoryOptions.value.includes(form.category)) {
      form.category = categoryOptions.value[0]
    }
  },
)

watch(
  () => form.date,
  () => {
    if (form.periodType === 'daily' && form.date) {
      form.periodMonth = form.date.slice(0, 7)
    }
  },
)

function submit() {
  emit('submit', { ...form })
  if (!props.modelValue) Object.assign(form, emptyForm())
}
</script>

<template>
  <form class="rounded-md border border-stone-200 bg-white p-5" @submit.prevent="submit">
    <div class="mb-5 flex items-center justify-between gap-3">
      <div>
        <h2 class="text-base font-bold text-ink">{{ modelValue ? 'Sửa giao dịch' : 'Thêm giao dịch' }}</h2>
        <p class="text-sm text-stone-500">Có thể nhập theo ngày hoặc theo tháng cho lương, thưởng, thuê mặt bằng.</p>
      </div>
      <button v-if="modelValue" class="btn-secondary" type="button" @click="$emit('cancel')">Hủy</button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Kiểu ghi nhận</span>
        <select v-model="form.periodType" class="form-input">
          <option value="daily">Theo ngày</option>
          <option value="monthly">Theo tháng</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Loại</span>
        <select v-model="form.type" class="form-input">
          <option value="income">Thu</option>
          <option value="expense">Chi</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Danh mục</span>
        <select v-model="form.category" class="form-input">
          <option v-for="category in categoryOptions" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>

      <label class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Số tiền</span>
        <input v-model.number="form.amount" class="form-input" min="1000" required step="1000" type="number" />
      </label>

      <label v-if="form.periodType === 'daily'" class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Ngày</span>
        <input v-model="form.date" class="form-input" required type="date" />
      </label>

      <label v-else class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Tháng</span>
        <input v-model="form.periodMonth" class="form-input" required type="month" />
      </label>

      <label class="space-y-1">
        <span class="text-sm font-semibold text-stone-600">Thanh toán</span>
        <select v-model="form.paymentMethod" class="form-input">
          <option value="cash">Tiền mặt</option>
          <option value="bank">Chuyển khoản</option>
          <option value="card">Thẻ</option>
          <option value="wallet">Ví điện tử</option>
        </select>
      </label>

      <label class="space-y-1 md:col-span-2">
        <span class="text-sm font-semibold text-stone-600">Ghi chú</span>
        <textarea v-model="form.note" class="form-input min-h-24 resize-y" />
      </label>
    </div>

    <div class="mt-5 flex justify-end">
      <button class="btn-primary" :disabled="loading" type="submit">
        <Save class="h-4 w-4" />
        {{ modelValue ? 'Lưu thay đổi' : 'Thêm giao dịch' }}
      </button>
    </div>
  </form>
</template>
