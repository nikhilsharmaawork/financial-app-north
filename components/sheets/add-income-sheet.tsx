'use client'

import { useState } from 'react'
import { Field, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function AddIncomeSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addIncome } = useStore()
  const [name, setName] = useState('')
  const [monthly, setMonthly] = useState('')
  const [payday, setPayday] = useState('')

  const valid = name.trim().length > 0 && Number(monthly) > 0 && !!payday

  function submit() {
    if (!valid) return
    addIncome({
      name: name.trim(),
      monthly: Number(monthly),
      nextPayday: new Date(payday).toISOString(),
    })
    setName('')
    setMonthly('')
    setPayday('')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add income source"
      description="A job, stipend, or recurring payout."
    >
      <div className="flex flex-col gap-4">
        <Field label="Source name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Freelance Design"
          />
        </Field>
        <Field label="Monthly amount">
          <TextInput
            inputMode="decimal"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Next payday">
          <TextInput type="date" value={payday} onChange={(e) => setPayday(e.target.value)} />
        </Field>
        <button
          onClick={submit}
          disabled={!valid}
          className={cn(
            'mt-2 rounded-2xl py-4 text-base font-semibold transition-all',
            valid
              ? 'bg-primary text-primary-foreground active:scale-[0.98]'
              : 'cursor-not-allowed bg-secondary text-muted-foreground',
          )}
        >
          Add income source
        </button>
      </div>
    </Sheet>
  )
}
