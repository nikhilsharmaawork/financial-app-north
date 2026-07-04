import type { AppState } from './types'

function daysFromNow(n: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export const demoState: AppState = {
  onboarded: false,
  profile: {
    name: 'Arjun',
    country: 'Latvia',
    status: 'Student',
    currency: 'EUR',
  },
  accounts: [
    { id: 'a1', name: 'Swedbank Checking', type: 'checking', balance: 1840.5 },
    { id: 'a2', name: 'Revolut Savings', type: 'savings', balance: 3200 },
    { id: 'a3', name: 'Cash Wallet', type: 'cash', balance: 120 },
  ],
  income: [
    {
      id: 'i1',
      name: 'Part-time Barista',
      monthly: 820,
      nextPayday: daysFromNow(9),
    },
    {
      id: 'i2',
      name: 'Freelance Design',
      monthly: 450,
      nextPayday: daysFromNow(21),
    },
  ],
  transactions: [
    {
      id: 't1',
      name: 'Rimi Groceries',
      amount: -42.3,
      date: daysFromNow(-1),
      accountId: 'a1',
      category: 'Food',
    },
    {
      id: 't2',
      name: 'Rīgas Satiksme Pass',
      amount: -25,
      date: daysFromNow(-2),
      accountId: 'a1',
      category: 'Transport',
    },
    {
      id: 't3',
      name: 'Barista Paycheck',
      amount: 410,
      date: daysFromNow(-4),
      accountId: 'a1',
      category: 'Income',
    },
    {
      id: 't4',
      name: 'Circle K Coffee',
      amount: -3.8,
      date: daysFromNow(-4),
      accountId: 'a3',
      category: 'Food',
    },
    {
      id: 't5',
      name: 'Netflix',
      amount: -11.99,
      date: daysFromNow(-6),
      accountId: 'a1',
      category: 'Other',
    },
    {
      id: 't6',
      name: 'Transfer to Savings',
      amount: -200,
      date: daysFromNow(-7),
      accountId: 'a1',
      category: 'Savings',
    },
  ],
  events: [
    {
      id: 'e1',
      name: 'Apartment Rent',
      type: 'bill',
      amount: -430,
      date: daysFromNow(3),
      recurring: 'monthly',
    },
    {
      id: 'e2',
      name: 'University Tuition',
      type: 'tuition',
      amount: -1200,
      date: daysFromNow(12),
      recurring: 'once',
    },
    {
      id: 'e3',
      name: 'Residence Permit Fee',
      type: 'residence',
      amount: -145,
      date: daysFromNow(18),
      recurring: 'once',
    },
    {
      id: 'e4',
      name: 'Laptop EMI',
      type: 'emi',
      amount: -68,
      date: daysFromNow(5),
      recurring: 'monthly',
    },
    {
      id: 'e5',
      name: 'Barista Salary',
      type: 'salary',
      amount: 820,
      date: daysFromNow(9),
      recurring: 'monthly',
    },
    {
      id: 'e6',
      name: 'Phone Plan',
      type: 'bill',
      amount: -15,
      date: daysFromNow(1),
      recurring: 'monthly',
    },
    {
      id: 'e7',
      name: 'Freelance Payout',
      type: 'salary',
      amount: 450,
      date: daysFromNow(21),
      recurring: 'monthly',
    },
    {
      id: 'e8',
      name: 'Gym Membership',
      type: 'bill',
      amount: -29,
      date: daysFromNow(24),
      recurring: 'monthly',
    },
  ],
  goals: [
    {
      id: 'g1',
      name: 'Emergency Fund',
      icon: 'shield',
      saved: 1400,
      target: 3000,
      color: '#5cc08a',
    },
    {
      id: 'g2',
      name: 'Flight Home',
      icon: 'plane',
      saved: 320,
      target: 700,
      color: '#d9a441',
    },
    {
      id: 'g3',
      name: 'New Laptop',
      icon: 'laptop',
      saved: 540,
      target: 1500,
      color: '#6aa9e0',
    },
    {
      id: 'g4',
      name: 'Winter Trip',
      icon: 'mountain',
      saved: 90,
      target: 600,
      color: '#c084d9',
    },
  ],
}
