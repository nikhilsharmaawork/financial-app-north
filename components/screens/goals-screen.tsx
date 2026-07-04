'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { GoalIcon } from '@/components/event-icon'
import { ScreenHeader } from '@/components/screen-header'
import { AddGoalSheet } from '@/components/sheets/add-goal-sheet'
import { ProgressBar } from '@/components/ui/progress-bar'
import { formatMoney } from '@/lib/finance'
import { useStore } from '@/lib/store'

export function GoalsScreen() {
  const { state, contributeToGoal } = useStore()
  const currency = state.profile.currency
  const [addOpen, setAddOpen] = useState(false)

  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0)

  return (
    <div className="animate-screen-in">
      <ScreenHeader
        subtitle="Saving toward"
        title="Goals"
        action={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add goal"
            className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            <Plus className="size-4" />
            Add
          </button>
        }
      />

      {/* Summary */}
      <section className="px-6 pb-4">
        <div className="rounded-3xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total saved</p>
          <p className="mt-1 font-serif text-3xl text-foreground">
            {formatMoney(totalSaved, currency, { decimals: false })}
            <span className="ml-2 text-base font-normal text-muted-foreground">
              of {formatMoney(totalTarget, currency, { decimals: false })}
            </span>
          </p>
          <ProgressBar
            className="mt-4"
            value={totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}
          />
        </div>
      </section>

      {/* Goal cards */}
      <section className="flex flex-col gap-3 px-6 pb-4">
        {state.goals.map((g) => {
          const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0
          const complete = g.saved >= g.target
          return (
            <div key={g.id} className="rounded-3xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div
                  className="grid size-12 shrink-0 place-items-center rounded-2xl"
                  style={{ backgroundColor: `${g.color}22` }}
                >
                  <GoalIcon icon={g.icon} className="size-6" style={{ color: g.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{g.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatMoney(g.saved, currency, { decimals: false })} of{' '}
                    {formatMoney(g.target, currency, { decimals: false })}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold" style={{ color: g.color }}>
                  {Math.round(pct)}%
                </span>
              </div>
              <ProgressBar className="mt-4" value={pct} color={g.color} />
              <button
                onClick={() => contributeToGoal(g.id, 50)}
                disabled={complete}
                className="mt-4 w-full rounded-xl bg-secondary py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                {complete ? 'Goal reached' : `Add ${formatMoney(50, currency, { decimals: false })}`}
              </button>
            </div>
          )
        })}
      </section>

      <AddGoalSheet open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
