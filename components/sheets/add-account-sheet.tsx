'use client'

import { useState } from 'react'
import { Field, SelectInput, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { AccountType } from '@/lib/types'
import { cn } from '@/lib/utils'

export function AddAccountSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addAccount } = useStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('checking')
  const [balance, setBalance] = useState('')

  const valid = name.trim().length > 0 && balance !== ''

  function submit() {
    if (!valid) return
    addAccount({ name: name.trim(), type, balance: Number(balance) })
    setName('')
    setBalance('')
    setType('checking')
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title="Add account" description="Bank, savings, or cash.">
      <div className="flex flex-col gap-4">
        <Field label="Account name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Revolut Savings"
          />
        </Field>
        <Field label="Type">
          <SelectInput value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
          </SelectInput>
        </Field>
        <Field label="Current balance">
          <TextInput
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <SubmitButton valid={valid} onClick={submit} label="Add account" />
      </div>
    </Sheet>
  )
}

function SubmitButton({
  valid,
  onClick,
  label,
}: {
  valid: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={!valid}
      className={cn(
        'mt-2 rounded-2xl py-4 text-base font-semibold transition-all',
        valid
          ? 'bg-primary text-primary-foreground active:scale-[0.98]'
          : 'cursor-not-allowed bg-secondary text-muted-foreground',
      )}
    >
      {label}
    </button>
  )
}
