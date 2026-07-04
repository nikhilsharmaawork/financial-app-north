'use client'

import { Send, Settings, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  financialHealth,
  formatMoney,
  reservedAmount,
  safeToSpend,
  totalBalance,
  upcomingEvents,
} from '@/lib/finance'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const suggestions = [
  'How much can I spend today?',
  'What bills are coming up?',
  'How is my financial health?',
  'Am I saving enough?',
]

export function AiScreen({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state } = useStore()
  const currency = state.profile.currency
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: 'assistant',
      text: `Hi ${state.profile.name}, I'm North AI. Ask me anything about your money — spending, upcoming bills, or your goals.`,
    },
  ])
  const [input, setInput] = useState('')
  const idRef = useRef(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  function answer(question: string): string {
    const q = question.toLowerCase()
    const sts = safeToSpend(state)
    if (q.includes('spend') || q.includes('today') || q.includes('day')) {
      return `You can safely spend about ${formatMoney(sts.perDay, currency)} per day for the next ${sts.days} days. That keeps ${formatMoney(reservedAmount(state), currency, { decimals: false })} reserved for upcoming bills.`
    }
    if (q.includes('bill') || q.includes('upcoming') || q.includes('due')) {
      const next = upcomingEvents(state, 3)
        .map((e) => `${e.name} (${formatMoney(e.amount, currency, { sign: true, decimals: false })})`)
        .join(', ')
      return `Your next items are: ${next}. I've already reserved money for these in your safe-to-spend figure.`
    }
    if (q.includes('health') || q.includes('doing') || q.includes('risk')) {
      const h = financialHealth(state)
      return `Your financial health is "${h.level}" with a score of ${h.score}/100. You have ${formatMoney(totalBalance(state), currency, { decimals: false })} across your accounts and ${formatMoney(reservedAmount(state), currency, { decimals: false })} in near-term obligations.`
    }
    if (q.includes('save') || q.includes('saving') || q.includes('goal')) {
      const saved = state.goals.reduce((s, g) => s + g.saved, 0)
      const target = state.goals.reduce((s, g) => s + g.target, 0)
      return `You've saved ${formatMoney(saved, currency, { decimals: false })} toward ${formatMoney(target, currency, { decimals: false })} across ${state.goals.length} goals. Setting aside even ${formatMoney(sts.perDay * 0.15, currency, { decimals: false })} a day would speed things up nicely.`
    }
    return `I can help with spending, upcoming bills, financial health, and savings goals. Try one of the suggestions above, or ask about a specific account.`
  }

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: idRef.current++, role: 'user', text: trimmed }
    const aiMsg: Message = {
      id: idRef.current++,
      role: 'assistant',
      text: answer(trimmed),
    }
    setMessages((m) => [...m, userMsg, aiMsg])
    setInput('')
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  return (
    <div className="animate-screen-in flex h-dvh flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pb-4 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Assistant</p>
            <h1 className="font-serif text-2xl leading-none text-foreground">North AI</h1>
          </div>
        </div>
        <button
          onClick={onOpenSettings}
          aria-label="Settings"
          className="grid size-10 place-items-center rounded-full bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings className="size-5" />
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-6">
        <div className="flex flex-col gap-3 pb-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed',
                m.role === 'user'
                  ? 'self-end bg-primary text-primary-foreground'
                  : 'self-start border border-border bg-card text-foreground',
              )}
            >
              {m.text}
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-6 pb-3">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="shrink-0 rounded-full border border-border bg-secondary px-3.5 py-2 text-sm text-foreground transition-colors hover:border-primary/50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-center gap-2 border-t border-border bg-card px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Ask North AI..."
          className="h-11 flex-1 rounded-full border border-input bg-secondary px-4 text-base text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-ring"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim()}
          className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 disabled:opacity-40"
        >
          <Send className="size-5" />
        </button>
      </form>
    </div>
  )
}
