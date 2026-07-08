'use client'

import { Loader as Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Field, SelectInput, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { Transaction, TxCategory } from '@/lib/types'
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
  transaction,
}: {
  open: boolean
  onClose: () => void
  /** Pass an existing transaction to edit it instead of creating a new one. */
  transaction?: Transaction | null
}) {
  const { state, addTransaction, editTransaction, deleteTransaction } = useStore()
  const isEdit = !!transaction

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '')
  const [category, setCategory] = useState<TxCategory>('Food')
  const [loading, setLoading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Load values whenever the sheet opens (for edit) or resets (for add)
  useEffect(() => {
    if (!open) return
    setConfirmDelete(false)
    if (transaction) {
      setType(transaction.amount >= 0 ? 'income' : 'expense')
      setName(transaction.name)
      setAmount(String(Math.abs(transaction.amount)))
      setAccountId(transaction.accountId)
      setCategory(transaction.category)
    } else {
      setName('')
      setAmount('')
      setType('expense')
      setCategory('Food')
      setAccountId(state.accounts[0]?.id ?? '')
    }
  }, [open, transaction, state.accounts])

  const valid = name.trim().length > 0 && Number(amount) > 0 && accountId

  async function submit() {
    if (!valid || loading) return
    setLoading(true)
    const value = Number(amount)
    const payload = {
      name: name.trim(),
      amount: type === 'expense' ? -value : value,
      date: transaction?.date ?? new Date().toISOString(),
      accountId,
      category: type === 'income' ? ('Income' as TxCategory) : category,
    }
    if (isEdit && transaction) {
      await editTransaction(transaction.id, payload)
    } else {
      await addTransaction(payload)
    }
    setLoading(false)
    onClose()
  }

  async function handleDelete() {
    if (!transaction) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading(true)
    await deleteTransaction(transaction.id)
    setLoading(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit transaction' : 'Add transaction'}
      description={isEdit ? 'Update the details below.' : 'Record money going in or out.'}
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
          {loading && !confirmDelete ? (
            <Loader2 className="mx-auto size-5 animate-spin" />
          ) : isEdit ? (
            'Save changes'
          ) : (
            'Save transaction'
          )}
        </button>

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className={cn(
              'flex h-13 items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold transition-all',
              confirmDelete
                ? 'bg-destructive text-white'
                : 'border border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            <Trash2 className="size-5" />
            {confirmDelete ? 'Tap again to confirm delete' : 'Delete transaction'}
          </button>
        )}
      </div>
    </Sheet>
  )
}
