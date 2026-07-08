'use client'

import { Loader as Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Field, SelectInput, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { Budget, TxCategory } from '@/lib/types'
import { cn } from '@/lib/utils'

const categories: TxCategory[] = [
  'Food',
  'Housing',
  'Transport',
  'Education',
  'Legal',
  'Savings',
  'Other',
]

export function AddBudgetSheet({
  open,
  onClose,
  budget,
}: {
  open: boolean
  onClose: () => void
  budget?: Budget | null
}) {
  const { state, addBudget, updateBudget, deleteBudget } = useStore()
  const isEdit = !!budget

  const usedCategories = new Set(state.budgets.map((b) => b.category))
  const availableCategories = categories.filter(
    (c) => c === budget?.category || !usedCategories.has(c),
  )

  const [category, setCategory] = useState<TxCategory>(availableCategories[0] ?? 'Food')
  const [limit, setLimit] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    if (budget) {
      setCategory(budget.category)
      setLimit(String(budget.monthlyLimit))
    } else {
      setCategory(availableCategories[0] ?? 'Food')
      setLimit('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budget])

  const valid = Number(limit) > 0 && category

  async function submit() {
    if (!valid || loading) return
    setLoading(true)
    if (isEdit && budget) {
      await updateBudget(budget.id, Number(limit))
    } else {
      await addBudget({ category, monthlyLimit: Number(limit) })
    }
    setLoading(false)
    onClose()
  }

  async function handleDelete() {
    if (!budget) return
    setLoading(true)
    await deleteBudget(budget.id)
    setLoading(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit budget' : 'Add budget'}
      description="Set a monthly spending limit for a category."
    >
      <div className="flex flex-col gap-4">
        <Field label="Category">
          <SelectInput
            value={category}
            disabled={isEdit}
            onChange={(e) => setCategory(e.target.value as TxCategory)}
          >
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Monthly limit">
          <TextInput
            inputMode="decimal"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="0.00"
          />
        </Field>

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
          {loading ? <Loader2 className="mx-auto size-5 animate-spin" /> : isEdit ? 'Save changes' : 'Save budget'}
        </button>

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-4 text-base font-semibold text-destructive transition-all"
          >
            <Trash2 className="size-5" />
            Delete budget
          </button>
        )}
      </div>
    </Sheet>
  )
}
