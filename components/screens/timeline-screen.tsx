'use client'

import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { EventIcon } from '@/components/event-icon'
import { ScreenHeader } from '@/components/screen-header'
import { AddEventSheet } from '@/components/sheets/add-event-sheet'
import {
  daysUntil,
  formatDate,
  formatDayLabel,
  formatMoney,
  monthKey,
  upcomingEvents,
} from '@/lib/finance'
import { useStore } from '@/lib/store'
import type { FinanceEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type View = 'daily' | 'future'

export function TimelineScreen({ onOpenSettings }: { onOpenSettings?: () => void } = {}) {
  const { state } = useStore()
  const currency = state.profile.currency
  const [view, setView] = useState<View>('daily')
  const [addOpen, setAddOpen] = useState(false)

  const events = useMemo(() => upcomingEvents(state), [state])

  const dailyGroups = useMemo(() => {
    const today: FinanceEvent[] = []
    const tomorrow: FinanceEvent[] = []
    const thisWeek: FinanceEvent[] = []
    const later: FinanceEvent[] = []
    for (const e of events) {
      const d = daysUntil(e.date)
      if (d === 0) today.push(e)
      else if (d === 1) tomorrow.push(e)
      else if (d <= 7) thisWeek.push(e)
      else later.push(e)
    }
    return [
      { label: 'Today', items: today },
      { label: 'Tomorrow', items: tomorrow },
      { label: 'This week', items: thisWeek },
      { label: 'Later', items: later },
    ].filter((g) => g.items.length > 0)
  }, [events])

  const futureGroups = useMemo(() => {
    const map = new Map<string, FinanceEvent[]>()
    for (const e of events) {
      const key = monthKey(e.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items: items.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    }))
  }, [events])

  const groups = view === 'daily' ? dailyGroups : futureGroups

  return (
    <div className="animate-screen-in">
      <ScreenHeader
        subtitle="What's coming"
        title="Timeline"
        onProfileClick={onOpenSettings}
        action={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add event"
            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <Plus className="size-4" />
            Add
          </button>
        }
      />

      {/* View toggle */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-1 rounded-2xl bg-secondary p-1">
          {(['daily', 'future'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'h-10 rounded-xl text-sm font-semibold capitalize transition-colors',
                view === v
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground',
              )}
            >
              {v === 'daily' ? 'Daily' : 'Future'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-4">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((e) => {
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
                        {formatDate(e.date)} · {formatDayLabel(e.date)}
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
        ))}
      </div>

      <AddEventSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
