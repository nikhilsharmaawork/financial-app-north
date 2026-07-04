'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { supabase } from '@/lib/supabase'
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
  loading: boolean
  error: string | null
  completeOnboarding: (payload: {
    profile: Partial<Profile>
    income: Omit<IncomeSource, 'id'>
    account: Omit<Account, 'id'>
  }) => Promise<void>
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>
  addIncome: (income: Omit<IncomeSource, 'id'>) => Promise<void>
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>
  addEvent: (event: Omit<FinanceEvent, 'id'>) => Promise<void>
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>
  contributeToGoal: (goalId: string, amount: number) => Promise<void>
  updateProfile: (profile: Partial<Profile>) => Promise<void>
  resetApp: () => Promise<void>
  refreshData: () => Promise<void>
}

const StoreContext = createContext<StoreValue | null>(null)

const defaultProfile: Profile = {
  name: '',
  country: 'Latvia',
  status: 'Student',
  currency: 'EUR',
}

const defaultState: AppState = {
  onboarded: false,
  profile: defaultProfile,
  accounts: [],
  income: [],
  transactions: [],
  events: [],
  goals: [],
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const fetchUserData = useCallback(async (uid: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle()

      if (profileError) throw profileError

      if (!profileData) {
        setState(defaultState)
        setLoading(false)
        return
      }

      const [accountsRes, incomeRes, transactionsRes, eventsRes, goalsRes] = await Promise.all([
        supabase.from('accounts').select('*').eq('user_id', uid),
        supabase.from('income_sources').select('*').eq('user_id', uid),
        supabase.from('transactions').select('*').eq('user_id', uid).order('date', { ascending: false }),
        supabase.from('events').select('*').eq('user_id', uid),
        supabase.from('goals').select('*').eq('user_id', uid),
      ])

      if (accountsRes.error) throw accountsRes.error
      if (incomeRes.error) throw incomeRes.error
      if (transactionsRes.error) throw transactionsRes.error
      if (eventsRes.error) throw eventsRes.error
      if (goalsRes.error) throw goalsRes.error

      setState({
        onboarded: profileData.onboarded,
        profile: {
          name: profileData.name,
          country: profileData.country as Profile['country'],
          status: profileData.status as Profile['status'],
          currency: profileData.currency as Profile['currency'],
        },
        accounts: accountsRes.data.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type as Account['type'],
          balance: Number(a.balance),
        })),
        income: incomeRes.data.map((i) => ({
          id: i.id,
          name: i.name,
          monthly: Number(i.monthly),
          nextPayday: i.next_payday,
        })),
        transactions: transactionsRes.data.map((t) => ({
          id: t.id,
          name: t.name,
          amount: Number(t.amount),
          date: t.date,
          accountId: t.account_id,
          category: t.category as Transaction['category'],
        })),
        events: eventsRes.data.map((e) => ({
          id: e.id,
          name: e.name,
          type: e.type as FinanceEvent['type'],
          amount: Number(e.amount),
          date: e.date,
          recurring: e.recurring as FinanceEvent['recurring'],
        })),
        goals: goalsRes.data.map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.icon,
          saved: Number(g.saved),
          target: Number(g.target),
          color: g.color,
        })),
      })
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUserId(session.user.id)
        fetchUserData(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setUserId(null)
        setState(defaultState)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id)
        fetchUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchUserData])

  const completeOnboarding = useCallback<StoreValue['completeOnboarding']>(
    async ({ profile, income, account }) => {
      if (!userId) return

      try {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: userId,
          name: profile.name ?? '',
          country: profile.country ?? 'Latvia',
          status: profile.status ?? 'Student',
          currency: profile.currency ?? 'EUR',
          onboarded: true,
        })

        if (profileError) throw profileError

        const { data: incomeData, error: incomeError } = await supabase
          .from('income_sources')
          .insert({
            user_id: userId,
            name: income.name,
            monthly: income.monthly,
            next_payday: income.nextPayday,
          })
          .select()
          .single()

        if (incomeError) throw incomeError

        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            name: account.name,
            type: account.type,
            balance: account.balance,
          })
          .select()
          .single()

        if (accountError) throw accountError

        setState((prev) => ({
          ...prev,
          onboarded: true,
          profile: { ...prev.profile, ...profile },
          income: [{ ...income, id: incomeData.id }],
          accounts: [{ ...account, id: accountData.id }],
        }))
      } catch (err) {
        console.error('Error completing onboarding:', err)
        setError(err instanceof Error ? err.message : 'Failed to complete onboarding')
      }
    },
    [userId],
  )

  const addAccount = useCallback<StoreValue['addAccount']>(
    async (account) => {
      if (!userId) return

      try {
        const { data, error: err } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            name: account.name,
            type: account.type,
            balance: account.balance,
          })
          .select()
          .single()

        if (err) throw err

        setState((prev) => ({
          ...prev,
          accounts: [...prev.accounts, { ...account, id: data.id }],
        }))
      } catch (err) {
        console.error('Error adding account:', err)
        setError(err instanceof Error ? err.message : 'Failed to add account')
      }
    },
    [userId],
  )

  const addIncome = useCallback<StoreValue['addIncome']>(
    async (income) => {
      if (!userId) return

      try {
        const { data, error: err } = await supabase
          .from('income_sources')
          .insert({
            user_id: userId,
            name: income.name,
            monthly: income.monthly,
            next_payday: income.nextPayday,
          })
          .select()
          .single()

        if (err) throw err

        setState((prev) => ({
          ...prev,
          income: [...prev.income, { ...income, id: data.id }],
        }))
      } catch (err) {
        console.error('Error adding income:', err)
        setError(err instanceof Error ? err.message : 'Failed to add income')
      }
    },
    [userId],
  )

  const addTransaction = useCallback<StoreValue['addTransaction']>(
    async (tx) => {
      if (!userId) return

      try {
        const { data, error: err } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            name: tx.name,
            amount: tx.amount,
            date: tx.date,
            account_id: tx.accountId,
            category: tx.category,
          })
          .select()
          .single()

        if (err) throw err

        const account = state.accounts.find((a) => a.id === tx.accountId)
        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: account.balance + tx.amount })
            .eq('id', tx.accountId)
        }

        setState((prev) => {
          const accounts = prev.accounts.map((a) =>
            a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a,
          )
          return {
            ...prev,
            accounts,
            transactions: [{ ...tx, id: data.id }, ...prev.transactions],
          }
        })
      } catch (err) {
        console.error('Error adding transaction:', err)
        setError(err instanceof Error ? err.message : 'Failed to add transaction')
      }
    },
    [userId, state.accounts],
  )

  const addEvent = useCallback<StoreValue['addEvent']>(
    async (event) => {
      if (!userId) return

      try {
        const { data, error: err } = await supabase
          .from('events')
          .insert({
            user_id: userId,
            name: event.name,
            type: event.type,
            amount: event.amount,
            date: event.date,
            recurring: event.recurring ?? null,
          })
          .select()
          .single()

        if (err) throw err

        setState((prev) => ({
          ...prev,
          events: [...prev.events, { ...event, id: data.id }],
        }))
      } catch (err) {
        console.error('Error adding event:', err)
        setError(err instanceof Error ? err.message : 'Failed to add event')
      }
    },
    [userId],
  )

  const addGoal = useCallback<StoreValue['addGoal']>(
    async (goal) => {
      if (!userId) return

      try {
        const { data, error: err } = await supabase
          .from('goals')
          .insert({
            user_id: userId,
            name: goal.name,
            icon: goal.icon,
            saved: goal.saved,
            target: goal.target,
            color: goal.color,
          })
          .select()
          .single()

        if (err) throw err

        setState((prev) => ({
          ...prev,
          goals: [...prev.goals, { ...goal, id: data.id }],
        }))
      } catch (err) {
        console.error('Error adding goal:', err)
        setError(err instanceof Error ? err.message : 'Failed to add goal')
      }
    },
    [userId],
  )

  const contributeToGoal = useCallback<StoreValue['contributeToGoal']>(
    async (goalId, amount) => {
      if (!userId) return

      try {
        const goal = state.goals.find((g) => g.id === goalId)
        if (!goal) return

        const newSaved = Math.min(goal.saved + amount, goal.target)

        const { error: err } = await supabase
          .from('goals')
          .update({ saved: newSaved })
          .eq('id', goalId)

        if (err) throw err

        setState((prev) => ({
          ...prev,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, saved: newSaved } : g,
          ),
        }))
      } catch (err) {
        console.error('Error contributing to goal:', err)
        setError(err instanceof Error ? err.message : 'Failed to contribute to goal')
      }
    },
    [userId, state.goals],
  )

  const updateProfile = useCallback<StoreValue['updateProfile']>(
    async (profile) => {
      if (!userId) return

      try {
        const updateData: Record<string, unknown> = {}
        if (profile.name !== undefined) updateData.name = profile.name
        if (profile.country !== undefined) updateData.country = profile.country
        if (profile.status !== undefined) updateData.status = profile.status
        if (profile.currency !== undefined) updateData.currency = profile.currency

        const { error: err } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('user_id', userId)

        if (err) throw err

        setState((prev) => ({
          ...prev,
          profile: { ...prev.profile, ...profile },
        }))
      } catch (err) {
        console.error('Error updating profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to update profile')
      }
    },
    [userId],
  )

  const resetApp = useCallback<StoreValue['resetApp']>(async () => {
    if (!userId) return

    try {
      await Promise.all([
        supabase.from('profiles').delete().eq('user_id', userId),
        supabase.from('accounts').delete().eq('user_id', userId),
        supabase.from('income_sources').delete().eq('user_id', userId),
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('events').delete().eq('user_id', userId),
        supabase.from('goals').delete().eq('user_id', userId),
      ])

      setState(defaultState)
    } catch (err) {
      console.error('Error resetting app:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset app')
    }
  }, [userId])

  const refreshData = useCallback<StoreValue['refreshData']>(async () => {
    if (userId) {
      await fetchUserData(userId)
    }
  }, [userId, fetchUserData])

  const value = useMemo<StoreValue>(
    () => ({
      state,
      loading,
      error,
      completeOnboarding,
      addAccount,
      addIncome,
      addTransaction,
      addEvent,
      addGoal,
      contributeToGoal,
      updateProfile,
      resetApp,
      refreshData,
    }),
    [
      state,
      loading,
      error,
      completeOnboarding,
      addAccount,
      addIncome,
      addTransaction,
      addEvent,
      addGoal,
      contributeToGoal,
      updateProfile,
      resetApp,
      refreshData,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
