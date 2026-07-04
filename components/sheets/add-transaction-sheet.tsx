'use client'

import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Field, SelectInput, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { TxCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

const categories: TxCategory[] = [
  'Food',
  'Housing',
  'Transport',
  'Education',
  'Legal',
  'Income',
  'Savings',
  'Other',
]

export function AddTransactionSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { state, addTransaction } = useStore()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '')
  const [category, setCategory] = useState<TxCategory>('Food')
  const [loading, setLoading] = useState(false)

  const valid = name.trim().length > 0 && Number(amount) > 0 && accountId

  function reset() {
    setName('')
    setAmount('')
    setType('expense')
    setCategory('Food')
  }

  async function submit() {
    if (!valid || loading) return
    setLoading(true)
    const value = Number(amount)
    await addTransaction({
      name: name.trim(),
      amount: type === 'expense' ? -value : value,
      date: new Date().toISOString(),
      accountId,
      category: type === 'income' ? 'Income' : category,
    })
    reset()
    setLoading(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add transaction"
      description="Record money going in or out."
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary p-1">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'h-10 rounded-xl text-sm font-semibold capitalize transition-colors',
                type === t
                  ? t === 'expense'
                    ? 'bg-danger/20 text-danger'
                    : 'bg-success/20 text-success'
                  : 'text-muted-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <Field label="Description">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rimi Groceries"
          />
        </Field>

        <Field label="Amount">
          <TextInput
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>

        <Field label="Account">
          <SelectInput value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {state.accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        {type === 'expense' && (
          <Field label="Category">
            <SelectInput
              value={category}
              onChange={(e) => setCategory(e.target.value as TxCategory)}
            >
              {categories
                .filter((c) => c !== 'Income')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </SelectInput>
          </Field>
        )}

        <button
          onClick={submit}
          disabled={!valid || loading}
          className={cn(
            'mt-2 h-13 rounded-2xl py-4 text-base font-semibold transition-all',
            valid && !loading
              ? 'bg-primary text-primary-foreground active:scale-[0.98]'
              : 'cursor-not-allowed bg-secondary text-muted-foreground',
          )}
        >
          {loading ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'Save transaction'}
        </button>
      </div>
    </Sheet>
  )
}
