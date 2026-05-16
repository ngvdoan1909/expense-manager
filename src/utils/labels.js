export const paymentMethodLabels = {
  cash: 'Tiền mặt',
  bank: 'Chuyển khoản',
  card: 'Thẻ',
  wallet: 'Ví điện tử',
}

export const transactionTypeLabels = {
  income: 'Thu',
  expense: 'Chi',
}

export const periodTypeLabels = {
  daily: 'Theo ngày',
  monthly: 'Theo tháng',
}

export function formatPaymentMethod(value) {
  return paymentMethodLabels[value] || 'Tiền mặt'
}

export function formatTransactionType(value) {
  return transactionTypeLabels[value] || value || ''
}

export function formatPeriodType(value) {
  return periodTypeLabels[value] || value || ''
}
