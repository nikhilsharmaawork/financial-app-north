'use client'

import { CalendarClock, Home, Sparkles, Target, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Tab = 'home' | 'money' | 'timeline' | 'goals' | 'ai'

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'money', label: 'Money', icon: Wallet },
  { id: 'timeline', label: 'Timeline', icon: CalendarClock },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'ai', label: 'AI', icon: Sparkles },
]

export function BottomNav({
  active,
  onChange,
}: {
  active: Tab
  onChange: (tab: Tab) => void
}) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-border bg-card/90 backdrop-blur-xl"
    >
      <ul className="flex items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
        {tabs.map((tab) => {
          const active_ = active === tab.id
          const Icon = tab.icon
          return (
            <li key={tab.id} className="flex-1">
              <button
                onClick={() => onChange(tab.id)}
                aria-current={active_ ? 'page' : undefined}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-xl py-1.5 transition-colors',
                  active_ ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active_ ? 2.4 : 1.8} />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
