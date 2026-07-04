'use client'

import { ArrowLeft, ArrowRight, Check, Loader as Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ChoiceGroup, Field, SelectInput, TextInput } from '@/components/ui/field'
import { ProgressBar } from '@/components/ui/progress-bar'
import { useStore } from '@/lib/store'
import type { Country, Status } from '@/lib/types'
import { cn } from '@/lib/utils'

const TOTAL = 5

export function Onboarding() {
  const { completeOnboarding } = useStore()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [country, setCountry] = useState<Country>('Latvia')
  const [status, setStatus] = useState<Status | null>(null)
  const [incomeName, setIncomeName] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [payday, setPayday] = useState('')
  const [accountName, setAccountName] = useState('')
  const [accountBalance, setAccountBalance] = useState('')

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return !!country
      case 1:
        return !!status
      case 2:
        return incomeName.trim().length > 0 && Number(incomeAmount) > 0
      case 3:
        return !!payday
      case 4:
        return accountName.trim().length > 0 && accountBalance !== ''
      default:
        return false
    }
  }, [step, country, status, incomeName, incomeAmount, payday, accountName, accountBalance])

  async function next() {
    if (!canProceed || loading) return
    if (step < TOTAL - 1) {
      setStep((s) => s + 1)
      return
    }
    setLoading(true)
    await completeOnboarding({
      profile: { country, status: status ?? 'Student' },
      income: {
        name: incomeName.trim(),
        monthly: Number(incomeAmount),
        nextPayday: new Date(payday).toISOString(),
      },
      account: {
        name: accountName.trim(),
        type: 'checking',
        balance: Number(accountBalance),
      },
    })
    setLoading(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-6 flex items-center gap-3">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              aria-label="Go back"
              className="grid size-9 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
                <span className="font-serif text-lg font-semibold">N</span>
              </div>
              <span className="font-serif text-lg text-foreground">North</span>
            </div>
          )}
          <span className="ml-auto text-sm text-muted-foreground">
            {step + 1} of {TOTAL}
          </span>
        </div>
        <ProgressBar value={((step + 1) / TOTAL) * 100} />
      </div>

      {/* Step content */}
      <div key={step} className="animate-screen-in flex-1">
        {step === 0 && (
          <StepShell
            title="Where are you based?"
            subtitle="We tailor rules and deadlines to your country of stay."
          >
            <Field label="Country of residence">
              <SelectInput
                value={country}
                onChange={(e) => setCountry(e.target.value as Country)}
              >
                <option value="Latvia">Latvia</option>
                <option value="Germany">Germany</option>
                <option value="Canada">Canada</option>
                <option value="Other">Other</option>
              </SelectInput>
            </Field>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            title="What brings you here?"
            subtitle="Your status shapes the deadlines we track for you."
          >
            <ChoiceGroup<Status>
              value={status}
              onChange={setStatus}
              options={[
                { value: 'Student', label: 'Student', description: 'Studying on a visa or permit' },
                { value: 'Worker', label: 'Worker', description: 'Employed on a work permit' },
                {
                  value: 'Permanent Resident',
                  label: 'Permanent Resident',
                  description: 'Settled long-term',
                },
              ]}
            />
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            title="Your first income"
            subtitle="Add a job, stipend, or side gig. You can add more later."
          >
            <div className="flex flex-col gap-4">
              <Field label="Income source name">
                <TextInput
                  value={incomeName}
                  onChange={(e) => setIncomeName(e.target.value)}
                  placeholder="e.g. Part-time Barista"
                />
              </Field>
              <Field label="Monthly amount">
                <TextInput
                  inputMode="decimal"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="820"
                />
              </Field>
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            title="When is your next payday?"
            subtitle="We use this to calculate what's safe to spend each day."
          >
            <Field label="Next payday">
              <TextInput
                type="date"
                value={payday}
                onChange={(e) => setPayday(e.target.value)}
              />
            </Field>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            title="Add your first account"
            subtitle="Your main bank or wallet, with its current balance."
          >
            <div className="flex flex-col gap-4">
              <Field label="Account name">
                <TextInput
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Swedbank Checking"
                />
              </Field>
              <Field label="Starting balance">
                <TextInput
                  inputMode="decimal"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(e.target.value)}
                  placeholder="1840"
                />
              </Field>
            </div>
          </StepShell>
        )}
      </div>

      {/* Footer */}
      <button
        onClick={next}
        disabled={!canProceed || loading}
        className={cn(
          'mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all',
          canProceed && !loading
            ? 'bg-primary text-primary-foreground active:scale-[0.98]'
            : 'cursor-not-allowed bg-secondary text-muted-foreground',
        )}
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : step === TOTAL - 1 ? (
          <>
            Finish setup
            <Check className="size-5" />
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="size-5" />
          </>
        )}
      </button>
    </div>
  )
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h1 className="font-serif text-3xl leading-tight text-foreground text-balance">
        {title}
      </h1>
      <p className="mt-2 mb-8 text-muted-foreground leading-relaxed">{subtitle}</p>
      {children}
    </div>
  )
}
