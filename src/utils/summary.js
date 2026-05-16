export function summarizeTransactions(transactions) {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const expense = transactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)

  return {
    income,
    expense,
    profit: income - expense,
  }
}

export function summarizeByCategory(transactions) {
  const rows = new Map()

  transactions.forEach((item) => {
    const key = `${item.type}-${item.category}`
    const current = rows.get(key) || {
      type: item.type,
      category: item.category,
      amount: 0,
      count: 0,
    }

    current.amount += Number(item.amount || 0)
    current.count += 1
    rows.set(key, current)
  })

  return [...rows.values()].sort((a, b) => b.amount - a.amount)
}

export function summarizeByPaymentMethod(transactions) {
  const rows = new Map()

  transactions.forEach((item) => {
    const key = item.paymentMethod || 'cash'
    const current = rows.get(key) || { paymentMethod: key, income: 0, expense: 0, count: 0 }

    current[item.type] += Number(item.amount || 0)
    current.count += 1
    rows.set(key, current)
  })

  return [...rows.values()].sort((a, b) => b.income + b.expense - (a.income + a.expense))
}

export function findTopExpenseCategory(transactions) {
  return summarizeByCategory(transactions).find((row) => row.type === 'expense') || null
}

export function calculateDailyAverage(transactions, dayCount) {
  const summary = summarizeTransactions(transactions)
  const divisor = Math.max(Number(dayCount || 1), 1)

  return {
    income: summary.income / divisor,
    expense: summary.expense / divisor,
    profit: summary.profit / divisor,
  }
}

export function getCurrentDateParts() {
  const now = new Date()
  return {
    day: now.getDate(),
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    date: now.toISOString().slice(0, 10),
  }
}
