'use client'

import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Coins,
  CreditCard,
  PiggyBank,
  Plus,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { ScreenHeader } from '@/components/screen-header'
import { AddAccountSheet } from '@/components/sheets/add-account-sheet'
import { AddIncomeSheet } from '@/components/sheets/add-income-sheet'
import { formatDate, formatMoney, monthlyIncome, totalBalance } from '@/lib/finance'
import { useStore } from '@/lib/store'
import type { AccountType } from '@/lib/types'
import { cn } from '@/lib/utils'

const accountIcons: Record<AccountType, LucideIcon> = {
  checking: CreditCard,
  savings: PiggyBank,
  cash: Coins,
}

export function MoneyScreen({ onAddTransaction }: { onAddTransaction: () => void }) {
  const { state } = useStore()
  const currency = state.profile.currency
  const [accountOpen, setAccountOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)

  return (
    <div className="animate-screen-in">
      <ScreenHeader subtitle="Overview" title="Money" />

      {/* Accounts */}
      <section className="px-6">
        <SectionTitle title="Accounts" onAdd={() => setAccountOpen(true)} addLabel="Add account" />
        <div className="flex flex-col gap-2">
          {state.accounts.map((a) => {
            const Icon = accountIcons[a.type]
            return (
              <div
                key={a.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{a.name}</p>
                  <p className="text-sm capitalize text-muted-foreground">{a.type}</p>
                </div>
                <p className="font-semibold text-foreground">
                  {formatMoney(a.balance, currency)}
                </p>
              </div>
            )
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 px-4 py-3.5">
          <span className="font-medium text-primary">Total balance</span>
          <span className="font-serif text-xl text-foreground">
            {formatMoney(totalBalance(state), currency)}
          </span>
        </div>
      </section>

      {/* Income sources */}
      <section className="px-6 pt-8">
        <SectionTitle
          title="Income sources"
          onAdd={() => setIncomeOpen(true)}
          addLabel="Add income source"
        />
        <div className="flex flex-col gap-2">
          {state.income.map((i) => (
            <div
              key={i.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
                <Banknote className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{i.name}</p>
                <p className="text-sm text-muted-foreground">
                  Next: {formatDate(i.nextPayday)}
                </p>
              </div>
              <p className="font-semibold text-success">
                {formatMoney(i.monthly, currency, { decimals: false })}/mo
              </p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-secondary px-4 py-3.5">
          <span className="font-medium text-muted-foreground">Monthly income</span>
          <span className="font-semibold text-foreground">
            {formatMoney(monthlyIncome(state), currency, { decimals: false })}
          </span>
        </div>
      </section>

      {/* Transactions */}
      <section className="px-6 pb-4 pt-8">
        <SectionTitle
          title="Transactions"
          onAdd={onAddTransaction}
          addLabel="Add transaction"
        />
        <ul className="flex flex-col gap-2">
          {state.transactions.map((t) => {
            const account = state.accounts.find((a) => a.id === t.accountId)
            const inflow = t.amount > 0
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5"
              >
                <div
                  className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full',
                    inflow ? 'bg-success/15 text-success' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {inflow ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{t.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {formatDate(t.date)} · {t.category}
                    {account ? ` · ${account.name}` : ''}
                  </p>
                </div>
                <p
                  className={cn(
                    'shrink-0 font-medium',
                    inflow ? 'text-success' : 'text-foreground',
                  )}
                >
                  {formatMoney(t.amount, currency, { sign: true })}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      <AddAccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
      <AddIncomeSheet open={incomeOpen} onClose={() => setIncomeOpen(false)} />
    </div>
  )
}

function SectionTitle({
  title,
  onAdd,
  addLabel,
}: {
  title: string
  onAdd: () => void
  addLabel: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-serif text-xl text-foreground">{title}</h2>
      <button
        onClick={onAdd}
        aria-label={addLabel}
        className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-accent"
      >
        <Plus className="size-4" />
        Add
      </button>
    </div>
  )
}
