import type { AppState, Currency, FinanceEvent } from './types'

const currencySymbols: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  CAD: 'C$',
}

export function formatMoney(
  amount: number,
  currency: Currency = 'EUR',
  opts?: { sign?: boolean; decimals?: boolean },
): string {
  const symbol = currencySymbols[currency]
  const decimals = opts?.decimals ?? true
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  })
  const signPrefix = opts?.sign ? (amount < 0 ? '-' : '+') : amount < 0 ? '-' : ''
  return `${signPrefix}${symbol}${formatted}`
}

export function totalBalance(state: AppState): number {
  return state.accounts.reduce((sum, a) => sum + a.balance, 0)
}

export function monthlyIncome(state: AppState): number {
  return state.income.reduce((sum, i) => sum + i.monthly, 0)
}

export function daysUntil(iso: string): number {
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

/** Next payday across all income sources (fewest days away). */
export function nextPaydayDays(state: AppState): number {
  const days = state.income.map((i) => daysUntil(i.nextPayday)).filter((d) => d >= 0)
  if (days.length === 0) return 30
  return Math.min(...days)
}

/** Sum of outflow events between now and the next payday (money to reserve). */
export function reservedAmount(state: AppState): number {
  const horizon = Math.max(nextPaydayDays(state), 1)
  return state.events
    .filter((e) => {
      const d = daysUntil(e.date)
      return e.amount < 0 && d >= 0 && d <= horizon
    })
    .reduce((sum, e) => sum + Math.abs(e.amount), 0)
}

export interface SafeToSpend {
  perDay: number
  available: number
  reserved: number
  days: number
}

export function safeToSpend(state: AppState): SafeToSpend {
  const available = totalBalance(state)
  const reserved = reservedAmount(state)
  const days = Math.max(nextPaydayDays(state), 1)
  const perDay = Math.max((available - reserved) / days, 0)
  return { perDay, available, reserved, days }
}

export type HealthLevel = 'Stable' | 'Tight' | 'High Risk'

export interface Health {
  level: HealthLevel
  score: number // 0-100
  color: string
}

export function financialHealth(state: AppState): Health {
  const { perDay, available, reserved } = safeToSpend(state)
  const coverage = reserved > 0 ? available / reserved : 4

  let score = 50
  if (coverage >= 2) score += 30
  else if (coverage >= 1.3) score += 15
  else if (coverage < 1) score -= 25

  if (perDay >= 25) score += 20
  else if (perDay >= 12) score += 8
  else if (perDay < 5) score -= 15

  score = Math.max(4, Math.min(98, score))

  let level: HealthLevel = 'Tight'
  let color = 'var(--warning)'
  if (score >= 70) {
    level = 'Stable'
    color = 'var(--success)'
  } else if (score < 40) {
    level = 'High Risk'
    color = 'var(--danger)'
  }
  return { level, score, color }
}

export function upcomingEvents(state: AppState, limit?: number): FinanceEvent[] {
  const sorted = [...state.events]
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return limit ? sorted.slice(0, limit) : sorted
}

export function formatDayLabel(iso: string): string {
  const d = daysUntil(iso)
  if (d === 0) return 'Today'
  if (d === 1) return 'Tomorrow'
  if (d < 0) return `${Math.abs(d)}d ago`
  return `in ${d} days`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
