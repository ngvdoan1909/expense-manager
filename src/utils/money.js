export function formatCurrency(value) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatPlainNumber(value) {
  return new Intl.NumberFormat('vi-VN').format(value || 0)
}
