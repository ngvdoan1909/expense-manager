import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/firebase/db'
import { validateTransactionPayload } from '@/utils/transactionValidation'

const transactionsRef = (uid) => collection(db, 'users', uid, 'transactions')
const queryCache = new Map()
const cacheTtl = 30_000

function cacheKey(uid, filters) {
  return JSON.stringify({
    uid,
    day: filters.day || '',
    month: filters.month || '',
    year: filters.year || '',
    type: filters.type || '',
    limit: filters.limit || 100,
  })
}

function clearTransactionCache() {
  queryCache.clear()
}

export function normalizeTransaction(form) {
  const periodType = form.periodType || 'daily'
  const periodMonth = form.periodMonth || form.date?.slice(0, 7)
  const dateValue = periodType === 'monthly' ? `${periodMonth}-01` : form.date
  const date = new Date(`${dateValue}T00:00:00`)

  return validateTransactionPayload({
    type: form.type,
    category: form.category.trim(),
    amount: Number(form.amount),
    periodType,
    periodMonth: dateValue.slice(0, 7),
    paymentMethod: form.paymentMethod || 'cash',
    note: form.note?.trim() || '',
    date: dateValue,
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  })
}

export async function fetchTransactions(uid, filters = {}) {
  const key = cacheKey(uid, filters)
  const cached = queryCache.get(key)

  if (cached && Date.now() - cached.time < cacheTtl) {
    return cached.rows
  }

  const constraints = []

  if (filters.day) constraints.push(where('day', '==', Number(filters.day)))
  if (filters.month) constraints.push(where('month', '==', Number(filters.month)))
  if (filters.year) constraints.push(where('year', '==', Number(filters.year)))
  if (filters.type) constraints.push(where('type', '==', filters.type))

  constraints.push(limit(filters.limit || 100))

  const snapshot = await getDocs(query(transactionsRef(uid), ...constraints))
  const rows = snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
  queryCache.set(key, { time: Date.now(), rows })

  return rows
}

export async function createTransaction(uid, form) {
  const result = await addDoc(transactionsRef(uid), {
    ...normalizeTransaction(form),
    createdAt: serverTimestamp(),
  })
  clearTransactionCache()
  return result
}

export async function updateTransaction(uid, id, form) {
  const result = await updateDoc(doc(db, 'users', uid, 'transactions', id), {
    ...normalizeTransaction(form),
    merchant: deleteField(),
  })
  clearTransactionCache()
  return result
}

export async function removeTransaction(uid, id) {
  const result = await deleteDoc(doc(db, 'users', uid, 'transactions', id))
  clearTransactionCache()
  return result
}
