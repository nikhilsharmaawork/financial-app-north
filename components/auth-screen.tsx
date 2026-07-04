'use client'

import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'

type AuthView = 'sign-in' | 'sign-up'

interface AuthScreenProps {
  onComplete: () => void
}

export function AuthScreen({ onComplete }: AuthScreenProps) {
  const [view, setView] = useState<AuthView>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, signUp, loading, error, clearError } = useAuth()

  const isSignIn = view === 'sign-in'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    clearError()
    if (isSignIn) {
      const result = await signIn(email, password)
      if (!result.error) {
        onComplete()
      }
    } else {
      const result = await signUp(email, password)
      if (!result.error) {
        onComplete()
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-serif text-lg font-semibold">N</span>
          </div>
          <span className="font-serif text-lg text-foreground">North</span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl leading-tight text-foreground">
          {isSignIn ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isSignIn
            ? 'Sign in to access your financial dashboard.'
            : 'Start your journey to better financial management.'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-12 w-full rounded-xl border border-input bg-secondary pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignIn ? 'Enter your password' : 'Create a password'}
              required
              minLength={6}
              className="h-12 w-full rounded-xl border border-input bg-secondary pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            'mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition-all',
            loading
              ? 'cursor-not-allowed bg-secondary text-muted-foreground'
              : 'bg-primary text-primary-foreground active:scale-[0.98]',
          )}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : isSignIn ? (
            'Sign in'
          ) : (
            'Create account'
          )}
        </button>
      </form>

      {/* Toggle view */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignIn ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => {
            setView(isSignIn ? 'sign-up' : 'sign-in')
            clearError()
          }}
          className="font-medium text-primary hover:underline"
        >
          {isSignIn ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  )
}
