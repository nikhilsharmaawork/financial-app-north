'use client'

import { Bell, ChevronRight, Plus } from 'lucide-react'
import { EventIcon } from '@/components/event-icon'
import { ProgressBar } from '@/components/ui/progress-bar'
import {
  financialHealth,
  formatDayLabel,
  formatMoney,
  monthlyIncome,
  reservedAmount,
  safeToSpend,
  totalBalance,
  upcomingEvents,
} from '@/lib/finance'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function HomeScreen({
  onAddExpense,
  onSeeTimeline,
}: {
  onAddExpense: () => void
  onSeeTimeline: () => void
}) {
  const { state } = useStore()
  const currency = state.profile.currency
  const balance = totalBalance(state)
  const income = monthlyIncome(state)
  const reserved = reservedAmount(state)
  const sts = safeToSpend(state)
  const health = financialHealth(state)
  const events = upcomingEvents(state, 4)

  return (
    <div className="animate-screen-in pb-4">
      {/* Greeting */}
      <header className="flex items-center justify-between px-6 pb-2 pt-8">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-serif text-2xl text-foreground">
            {state.profile.name}
          </h1>
        </div>
        <button
          aria-label="Notifications"
          className="relative grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-5" />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary" />
        </button>
      </header>

      {/* Balance / Safe to spend card */}
      <section className="px-6 pt-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total balance</p>
              <p className="mt-1 font-serif text-4xl text-foreground">
                {formatMoney(balance, currency, { decimals: false })}
              </p>
            </div>
            <HealthBadge level={health.level} color={health.color} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <MiniStat
              label="Monthly income"
              value={formatMoney(income, currency, { decimals: false })}
            />
            <MiniStat
              label="Reserved"
              value={formatMoney(reserved, currency, { decimals: false })}
            />
          </div>

          <div className="mt-4 rounded-2xl bg-primary/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/90">Safe to spend / day</p>
                <p className="mt-0.5 font-serif text-2xl text-foreground">
                  {formatMoney(sts.perDay, currency)}
                </p>
              </div>
              <p className="text-right text-xs text-muted-foreground">
                for the next
                <br />
                {sts.days} days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Financial health bar */}
      <section className="px-6 pt-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Financial health</p>
            <span className="text-sm text-muted-foreground">{health.score}/100</span>
          </div>
          <ProgressBar value={health.score} color={health.color} />
        </div>
      </section>

      {/* Upcoming events */}
      <section className="px-6 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-foreground">Upcoming</h2>
          <button
            onClick={onSeeTimeline}
            className="flex items-center gap-0.5 text-sm text-primary"
          >
            See all
            <ChevronRight className="size-4" />
          </button>
        </div>
        <ul className="flex flex-col gap-2">
          {events.map((e) => {
            const inflow = e.amount > 0
            return (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <div
                  className={cn(
                    'grid size-11 shrink-0 place-items-center rounded-xl',
                    inflow ? 'bg-success/15 text-success' : 'bg-secondary text-primary',
                  )}
                >
                  <EventIcon type={e.type} className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{e.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDayLabel(e.date)}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 font-medium',
                    inflow ? 'text-success' : 'text-foreground',
                  )}
                >
                  {formatMoney(e.amount, currency, { sign: true, decimals: false })}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Floating add expense button */}
      <button
        onClick={onAddExpense}
        className="fixed bottom-24 left-1/2 z-30 flex h-13 -translate-x-1/2 items-center gap-2 rounded-full bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-black/30 transition-transform active:scale-95"
      >
        <Plus className="size-5" />
        Add expense
      </button>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function HealthBadge({ level, color }: { level: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
      style={{ backgroundColor: `color-mix(in oklab, ${color} 18%, transparent)`, color }}
    >
      <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
      {level}
    </span>
  )
}
