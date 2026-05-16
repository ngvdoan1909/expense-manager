import { expenseCategories, incomeCategories } from '@/constants/categories'

export const transactionTypes = ['income', 'expense']
export const periodTypes = ['daily', 'monthly']
export const paymentMethods = ['cash', 'bank', 'card', 'wallet']

const datePattern = /^\d{4}-\d{2}-\d{2}$/
const monthPattern = /^\d{4}-\d{2}$/

export function validateTransactionPayload(payload) {
  const errors = []
  const categories = payload.type === 'income' ? incomeCategories : expenseCategories

  if (!transactionTypes.includes(payload.type)) errors.push('Loại giao dịch không hợp lệ.')
  if (!periodTypes.includes(payload.periodType)) errors.push('Kiểu ghi nhận không hợp lệ.')
  if (!categories.includes(payload.category)) errors.push('Danh mục không hợp lệ.')
  if (!paymentMethods.includes(payload.paymentMethod)) errors.push('Phương thức thanh toán không hợp lệ.')
  if (!Number.isFinite(payload.amount) || payload.amount < 1000 || payload.amount > 999999999999) {
    errors.push('Số tiền phải từ 1.000 đến 999.999.999.999.')
  }
  if (!datePattern.test(payload.date)) errors.push('Ngày không hợp lệ.')
  if (!monthPattern.test(payload.periodMonth)) errors.push('Tháng không hợp lệ.')
  if (!Number.isInteger(payload.day) || payload.day < 1 || payload.day > 31) errors.push('Ngày trong tháng không hợp lệ.')
  if (!Number.isInteger(payload.month) || payload.month < 1 || payload.month > 12) errors.push('Tháng trong năm không hợp lệ.')
  if (!Number.isInteger(payload.year) || payload.year < 2000 || payload.year > 2100) errors.push('Năm không hợp lệ.')
  if (typeof payload.note !== 'string' || payload.note.length > 500) errors.push('Ghi chú tối đa 500 ký tự.')

  if (errors.length) {
    throw new Error(errors[0])
  }

  return payload
}
