'use client'

import { ArrowLeft, Bell, Globe, LogOut, Moon, RotateCcw, Sun, User } from 'lucide-react'
import { Field, SelectInput } from '@/components/ui/field'
import { useStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-context'
import type { Country, Currency, Status } from '@/lib/types'

export function SettingsScreen({ onBack, onSignOut }: { onBack: () => void; onSignOut: () => void }) {
  const { state, updateProfile, resetApp } = useStore()
  const { theme, toggleTheme } = useTheme()
  const { profile } = state

  return (
    <div className="animate-screen-in pb-8">
      <header className="flex items-center gap-3 px-6 pb-4 pt-8">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="grid size-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="font-serif text-3xl text-foreground">Settings</h1>
      </header>

      {/* Profile card */}
      <section className="px-6 pb-6">
        <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5">
          <div className="grid size-14 place-items-center rounded-full bg-primary/15 text-primary">
            <span className="font-serif text-xl">{profile.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-serif text-xl text-foreground">{profile.name}</p>
            <p className="text-sm text-muted-foreground">
              {profile.status} · {profile.country}
            </p>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="px-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <User className="size-4" />
          Profile
        </h2>
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
          <Field label="Status">
            <SelectInput
              value={profile.status}
              onChange={(e) => updateProfile({ status: e.target.value as Status })}
            >
              <option value="Student">Student</option>
              <option value="Worker">Worker</option>
              <option value="Permanent Resident">Permanent Resident</option>
            </SelectInput>
          </Field>
          <Field label="Country">
            <SelectInput
              value={profile.country}
              onChange={(e) => updateProfile({ country: e.target.value as Country })}
            >
              <option value="Latvia">Latvia</option>
              <option value="Germany">Germany</option>
              <option value="Canada">Canada</option>
              <option value="Other">Other</option>
            </SelectInput>
          </Field>
          <Field label="Currency">
            <SelectInput
              value={profile.currency}
              onChange={(e) => updateProfile({ currency: e.target.value as Currency })}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="CAD">CAD (C$)</option>
            </SelectInput>
          </Field>
        </div>
      </section>

      {/* Toggles */}
      <section className="px-6 pt-6">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Globe className="size-4" />
          Preferences
        </h2>
        <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          <ToggleRow
            icon={theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />}
            label="Dark mode"
            checked={theme === 'dark'}
            onChange={toggleTheme}
          />
          <ToggleRow icon={<Bell className="size-5" />} label="Bill reminders" defaultOn />
          <ToggleRow icon={<Globe className="size-5" />} label="Localized deadlines" defaultOn />
        </div>
      </section>

      {/* Reset */}
      <section className="px-6 pt-6">
        <button
          onClick={async () => {
            await resetApp()
            onBack()
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-4 font-semibold text-destructive transition-colors hover:bg-destructive/20"
        >
          <RotateCcw className="size-5" />
          Reset all data
        </button>
      </section>

      {/* Sign out */}
      <section className="px-6 pt-4">
        <button
          onClick={onSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-secondary py-4 font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <LogOut className="size-5" />
          Sign out
        </button>
      </section>

      <p className="px-6 pt-6 text-center text-xs text-muted-foreground">
        North · Financial OS for newcomers
      </p>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  defaultOn,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  label: string
  defaultOn?: boolean
  checked?: boolean
  onChange?: () => void
}) {
  const isControlled = checked !== undefined
  return (
    <label className="flex cursor-pointer items-center gap-3 p-4">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 font-medium text-foreground">{label}</span>
      <input
        type="checkbox"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultOn}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="relative h-6 w-11 rounded-full bg-secondary transition-colors peer-checked:bg-primary">
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-foreground transition-transform peer-checked:translate-x-5 peer-checked:bg-primary-foreground" />
      </span>
    </label>
  )
}
