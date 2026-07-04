'use client'

import { cn } from '@/lib/utils'

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted-foreground">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-xl border border-input bg-secondary px-4 text-base text-foreground',
        'placeholder:text-muted-foreground/60 outline-none transition-colors',
        'focus:border-ring focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...props}
    />
  )
}

export function SelectInput({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-12 w-full appearance-none rounded-xl border border-input bg-secondary px-4 text-base text-foreground',
        'outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

export function ChoiceGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; description?: string }[]
  value: T | null
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-all',
              active
                ? 'border-primary bg-primary/10'
                : 'border-border bg-secondary hover:border-muted-foreground/40',
            )}
          >
            <div>
              <p className="font-medium text-foreground">{opt.label}</p>
              {opt.description && (
                <p className="text-sm text-muted-foreground">{opt.description}</p>
              )}
            </div>
            <span
              className={cn(
                'grid size-5 place-items-center rounded-full border-2 transition-colors',
                active ? 'border-primary bg-primary' : 'border-muted-foreground/40',
              )}
            >
              {active && <span className="size-2 rounded-full bg-primary-foreground" />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
