export type Country = 'Latvia' | 'Germany' | 'Canada' | 'Other'
export type Status = 'Student' | 'Worker' | 'Permanent Resident'

export type AccountType = 'checking' | 'savings' | 'cash'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
}

export interface IncomeSource {
  id: string
  name: string
  monthly: number
  nextPayday: string // ISO date
}

export type TxCategory =
  | 'Housing'
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Legal'
  | 'Income'
  | 'Savings'
  | 'Other'

export interface Transaction {
  id: string
  name: string
  amount: number // positive = income, negative = expense
  date: string // ISO date
  accountId: string
  category: TxCategory
}

export type EventType =
  | 'bill'
  | 'tuition'
  | 'residence'
  | 'emi'
  | 'salary'
  | 'other'

export interface FinanceEvent {
  id: string
  name: string
  type: EventType
  amount: number // positive = inflow, negative = outflow
  date: string // ISO date
  recurring?: 'monthly' | 'once'
}

export interface Goal {
  id: string
  name: string
  icon: string
  saved: number
  target: number
  color: string
}

export interface Budget {
  id: string
  category: TxCategory
  monthlyLimit: number
}

export type Currency = 'EUR' | 'USD' | 'CAD'

export interface Profile {
  name: string
  country: Country
  status: Status
  currency: Currency
}

export interface AppState {
  onboarded: boolean
  profile: Profile
  accounts: Account[]
  income: IncomeSource[]
  transactions: Transaction[]
  events: FinanceEvent[]
  goals: Goal[]
  budgets: Budget[]
}
