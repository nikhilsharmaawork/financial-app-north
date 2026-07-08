'use client'

import { useState } from 'react'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { AuthScreen } from '@/components/auth-screen'
import { Onboarding } from '@/components/onboarding'
import { AiScreen } from '@/components/screens/ai-screen'
import { GoalsScreen } from '@/components/screens/goals-screen'
import { HomeScreen } from '@/components/screens/home-screen'
import { MoneyScreen } from '@/components/screens/money-screen'
import { SettingsScreen } from '@/components/screens/settings-screen'
import { TimelineScreen } from '@/components/screens/timeline-screen'
import { AddTransactionSheet } from '@/components/sheets/add-transaction-sheet'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store'

export function AppShell() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { state, loading: storeLoading } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [addTxOpen, setAddTxOpen] = useState(false)

  // Show loading state
  if (authLoading || storeLoading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="grid size-12 place-items-center rounded-full bg-primary text-primary-foreground">
            <span className="font-serif text-xl font-semibold">N</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen onComplete={() => {}} />
  }

  // Show onboarding if not completed
  if (!state.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <main className="pb-28">
        {showSettings ? (
          <SettingsScreen onBack={() => setShowSettings(false)} onSignOut={signOut} />
        ) : (
          <>
            {tab === 'home' && (
              <HomeScreen
                onAddExpense={() => setAddTxOpen(true)}
                onSeeTimeline={() => setTab('timeline')}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
            {tab === 'money' && (
              <MoneyScreen
                onAddTransaction={() => setAddTxOpen(true)}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}
            {tab === 'timeline' && <TimelineScreen onOpenSettings={() => setShowSettings(true)} />}
            {tab === 'goals' && <GoalsScreen onOpenSettings={() => setShowSettings(true)} />}
            {tab === 'ai' && <AiScreen onOpenSettings={() => setShowSettings(true)} />}
          </>
        )}
      </main>

      {!showSettings && <BottomNav active={tab} onChange={setTab} />}

      <AddTransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  )
}
