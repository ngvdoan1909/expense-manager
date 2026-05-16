export const incomeCategories = ['Bán hàng', 'Lương', 'Thưởng']

export const expenseCategories = [
  'Nhập hàng',
  'Tiền điện',
  'Tiền nước',
  'Tiền internet',
  'Tiền thuê mặt bằng',
  'Tiền lương',
  'Ăn uống',
  'Mua sắm',
  'Xăng xe',
]

export const defaultCategories = [
  ...incomeCategories.map((name) => ({ name, type: 'income', budgetLimit: 0, active: true })),
  ...expenseCategories.map((name) => ({ name, type: 'expense', budgetLimit: 0, active: true })),
]

export function categoriesByType(type) {
  return type === 'income' ? incomeCategories : expenseCategories
}
