'use client'

import { useState } from 'react'
import { BottomNav, type Tab } from '@/components/bottom-nav'
import { Onboarding } from '@/components/onboarding'
import { AiScreen } from '@/components/screens/ai-screen'
import { GoalsScreen } from '@/components/screens/goals-screen'
import { HomeScreen } from '@/components/screens/home-screen'
import { MoneyScreen } from '@/components/screens/money-screen'
import { SettingsScreen } from '@/components/screens/settings-screen'
import { TimelineScreen } from '@/components/screens/timeline-screen'
import { AddTransactionSheet } from '@/components/sheets/add-transaction-sheet'
import { useStore } from '@/lib/store'

export function AppShell() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [showSettings, setShowSettings] = useState(false)
  const [addTxOpen, setAddTxOpen] = useState(false)

  if (!state.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      <main className="pb-28">
        {showSettings ? (
          <SettingsScreen onBack={() => setShowSettings(false)} />
        ) : (
          <>
            {tab === 'home' && (
              <HomeScreen
                onAddExpense={() => setAddTxOpen(true)}
                onSeeTimeline={() => setTab('timeline')}
              />
            )}
            {tab === 'money' && <MoneyScreen onAddTransaction={() => setAddTxOpen(true)} />}
            {tab === 'timeline' && <TimelineScreen />}
            {tab === 'goals' && <GoalsScreen />}
            {tab === 'ai' && <AiScreen onOpenSettings={() => setShowSettings(true)} />}
          </>
        )}
      </main>

      {!showSettings && <BottomNav active={tab} onChange={setTab} />}

      <AddTransactionSheet open={addTxOpen} onClose={() => setAddTxOpen(false)} />
    </div>
  )
}
