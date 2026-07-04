'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { demoState } from './demo-data'
import { uid } from './finance'
import type {
  Account,
  AppState,
  FinanceEvent,
  Goal,
  IncomeSource,
  Profile,
  Transaction,
} from './types'

interface StoreValue {
  state: AppState
  completeOnboarding: (payload: {
    profile: Partial<Profile>
    income: Omit<IncomeSource, 'id'>
    account: Omit<Account, 'id'>
  }) => void
  addAccount: (account: Omit<Account, 'id'>) => void
  addIncome: (income: Omit<IncomeSource, 'id'>) => void
  addTransaction: (tx: Omit<Transaction, 'id'>) => void
  addEvent: (event: Omit<FinanceEvent, 'id'>) => void
  addGoal: (goal: Omit<Goal, 'id'>) => void
  contributeToGoal: (goalId: string, amount: number) => void
  updateProfile: (profile: Partial<Profile>) => void
  resetApp: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(demoState)

  const completeOnboarding = useCallback<StoreValue['completeOnboarding']>(
    ({ profile, income, account }) => {
      setState((prev) => ({
        ...prev,
        onboarded: true,
        profile: { ...prev.profile, ...profile },
        income: [{ ...income, id: uid() }],
        accounts: [{ ...account, id: uid() }],
      }))
    },
    [],
  )

  const addAccount = useCallback<StoreValue['addAccount']>((account) => {
    setState((prev) => ({
      ...prev,
      accounts: [...prev.accounts, { ...account, id: uid() }],
    }))
  }, [])

  const addIncome = useCallback<StoreValue['addIncome']>((income) => {
    setState((prev) => ({
      ...prev,
      income: [...prev.income, { ...income, id: uid() }],
    }))
  }, [])

  const addTransaction = useCallback<StoreValue['addTransaction']>((tx) => {
    setState((prev) => {
      const accounts = prev.accounts.map((a) =>
        a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a,
      )
      return {
        ...prev,
        accounts,
        transactions: [{ ...tx, id: uid() }, ...prev.transactions],
      }
    })
  }, [])

  const addEvent = useCallback<StoreValue['addEvent']>((event) => {
    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...event, id: uid() }],
    }))
  }, [])

  const addGoal = useCallback<StoreValue['addGoal']>((goal) => {
    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id: uid() }],
    }))
  }, [])

  const contributeToGoal = useCallback<StoreValue['contributeToGoal']>(
    (goalId, amount) => {
      setState((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === goalId
            ? { ...g, saved: Math.min(g.saved + amount, g.target) }
            : g,
        ),
      }))
    },
    [],
  )

  const updateProfile = useCallback<StoreValue['updateProfile']>((profile) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...profile } }))
  }, [])

  const resetApp = useCallback(() => {
    setState({ ...demoState, onboarded: false })
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      completeOnboarding,
      addAccount,
      addIncome,
      addTransaction,
      addEvent,
      addGoal,
      contributeToGoal,
      updateProfile,
      resetApp,
    }),
    [
      state,
      completeOnboarding,
      addAccount,
      addIncome,
      addTransaction,
      addEvent,
      addGoal,
      contributeToGoal,
      updateProfile,
      resetApp,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
