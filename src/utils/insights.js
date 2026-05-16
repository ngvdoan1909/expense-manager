import { summarizeByCategory, summarizeTransactions } from '@/utils/summary'

function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate()
}

function percentChange(current, previous) {
  if (!previous && !current) return 0
  if (!previous) return 100
  return ((current - previous) / previous) * 100
}

export function getPreviousMonth(month, year) {
  if (month === 1) return { month: 12, year: year - 1 }
  return { month: month - 1, year }
}

export function forecastEndOfMonth(transactions, month, year, currentDay) {
  const summary = summarizeTransactions(transactions)
  const totalDays = daysInMonth(month, year)
  const elapsedDays = Math.min(Math.max(Number(currentDay || 1), 1), totalDays)
  const factor = totalDays / elapsedDays

  return {
    income: summary.income * factor,
    expense: summary.expense * factor,
    profit: summary.profit * factor,
  }
}

export function comparePeriods(currentRows, previousRows) {
  const current = summarizeTransactions(currentRows)
  const previous = summarizeTransactions(previousRows)

  return {
    current,
    previous,
    incomeChange: percentChange(current.income, previous.income),
    expenseChange: percentChange(current.expense, previous.expense),
    profitChange: percentChange(current.profit, previous.profit),
  }
}

export function detectAnomalies(currentRows, previousRows) {
  const current = summarizeByCategory(currentRows).filter((row) => row.type === 'expense')
  const previous = summarizeByCategory(previousRows).filter((row) => row.type === 'expense')
  const previousByCategory = Object.fromEntries(previous.map((row) => [row.category, row.amount]))

  return current
    .map((row) => {
      const previousAmount = Number(previousByCategory[row.category] || 0)
      const change = percentChange(row.amount, previousAmount)

      return {
        category: row.category,
        amount: row.amount,
        previousAmount,
        change,
      }
    })
    .filter((row) => row.amount >= 100000 && row.change >= 30)
    .sort((a, b) => b.change - a.change)
    .slice(0, 5)
}

export function calculateFinancialHealth(transactions) {
  const summary = summarizeTransactions(transactions)
  const savingsRate = summary.income > 0 ? (summary.profit / summary.income) * 100 : 0
  const savingsScore = Math.max(0, Math.min(100, savingsRate * 4))
  const cashflowScore = summary.profit >= 0 ? 100 : 20
  const expensePressure = summary.income > 0 ? (summary.expense / summary.income) * 100 : 100
  const pressureScore = Math.max(0, Math.min(100, 120 - expensePressure))
  const score = Math.round(savingsScore * 0.45 + cashflowScore * 0.3 + pressureScore * 0.25)

  return {
    score: Math.max(0, Math.min(100, score)),
    savingsRate,
    label: score >= 80 ? 'Rất tốt' : score >= 60 ? 'Ổn định' : score >= 40 ? 'Cần chú ý' : 'Rủi ro',
  }
}

export function buildCutSuggestions(currentRows, previousRows) {
  return detectAnomalies(currentRows, previousRows)
    .map((row) => ({
      title: `${row.category} tăng mạnh`,
      detail: `Danh mục này tăng ${Math.round(row.change)}% so với tháng trước. Cắt 20% sẽ giảm khoảng ${Math.round(row.amount * 0.2).toLocaleString('vi-VN')}đ.`,
      priority: row.amount,
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
}
