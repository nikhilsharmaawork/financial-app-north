'use client'

import { Loader as Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Field, SelectInput, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import type { EventType } from '@/lib/types'
import { cn } from '@/lib/utils'

const eventTypes: { value: EventType; label: string }[] = [
  { value: 'bill', label: 'Bill' },
  { value: 'tuition', label: 'Tuition' },
  { value: 'residence', label: 'Residence Permit' },
  { value: 'emi', label: 'EMI / Loan' },
  { value: 'salary', label: 'Salary / Income' },
  { value: 'other', label: 'Other' },
]

export function AddEventSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addEvent } = useStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<EventType>('bill')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const valid = name.trim().length > 0 && Number(amount) > 0 && !!date

  async function submit() {
    if (!valid || loading) return
    setLoading(true)
    const isInflow = type === 'salary'
    await addEvent({
      name: name.trim(),
      type,
      amount: isInflow ? Number(amount) : -Number(amount),
      date: new Date(date).toISOString(),
      recurring: 'once',
    })
    setName('')
    setAmount('')
    setDate('')
    setType('bill')
    setLoading(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add event"
      description="A bill, deadline, or expected payment."
    >
      <div className="flex flex-col gap-4">
        <Field label="Event name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Health Insurance"
          />
        </Field>
        <Field label="Type">
          <SelectInput value={type} onChange={(e) => setType(e.target.value as EventType)}>
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Amount">
          <TextInput
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </Field>
        <Field label="Date">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <button
          onClick={submit}
          disabled={!valid || loading}
          className={cn(
            'mt-2 rounded-2xl py-4 text-base font-semibold transition-all',
            valid && !loading
              ? 'bg-primary text-primary-foreground active:scale-[0.98]'
              : 'cursor-not-allowed bg-secondary text-muted-foreground',
          )}
        >
          {loading ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'Add event'}
        </button>
      </div>
    </Sheet>
  )
}
