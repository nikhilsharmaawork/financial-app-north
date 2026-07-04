'use client'

import { Loader as Loader2 } from 'lucide-react'
import { useState } from 'react'
import { GoalIcon } from '@/components/event-icon'
import { Field, TextInput } from '@/components/ui/field'
import { Sheet } from '@/components/ui/sheet'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const iconChoices: { icon: string; color: string }[] = [
  { icon: 'shield', color: '#5cc08a' },
  { icon: 'plane', color: '#d9a441' },
  { icon: 'laptop', color: '#6aa9e0' },
  { icon: 'mountain', color: '#c084d9' },
  { icon: 'target', color: '#e0a24a' },
]

export function AddGoalSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { addGoal } = useStore()
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [saved, setSaved] = useState('')
  const [choice, setChoice] = useState(0)
  const [loading, setLoading] = useState(false)

  const valid = name.trim().length > 0 && Number(target) > 0

  async function submit() {
    if (!valid || loading) return
    setLoading(true)
    const c = iconChoices[choice]
    await addGoal({
      name: name.trim(),
      target: Number(target),
      saved: Number(saved) || 0,
      icon: c.icon,
      color: c.color,
    })
    setName('')
    setTarget('')
    setSaved('')
    setChoice(0)
    setLoading(false)
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Add goal"
      description="Set a target and start saving toward it."
    >
      <div className="flex flex-col gap-4">
        <Field label="Goal name">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund"
          />
        </Field>
        <Field label="Icon">
          <div className="flex gap-2">
            {iconChoices.map((c, i) => (
              <button
                key={c.icon}
                type="button"
                onClick={() => setChoice(i)}
                aria-label={`Choose ${c.icon} icon`}
                className={cn(
                  'grid size-12 place-items-center rounded-xl border-2 transition-all',
                  choice === i ? 'border-primary' : 'border-border bg-secondary',
                )}
                style={choice === i ? { backgroundColor: `${c.color}20` } : undefined}
              >
                <GoalIcon icon={c.icon} className="size-5" style={{ color: c.color }} />
              </button>
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Target amount">
            <TextInput
              inputMode="decimal"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="3000"
            />
          </Field>
          <Field label="Already saved">
            <TextInput
              inputMode="decimal"
              value={saved}
              onChange={(e) => setSaved(e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>
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
          {loading ? <Loader2 className="mx-auto size-5 animate-spin" /> : 'Create goal'}
        </button>
      </div>
    </Sheet>
  )
}
