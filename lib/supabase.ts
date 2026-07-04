import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          country: string
          status: string
          currency: string
          onboarded: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          country?: string
          status?: string
          currency?: string
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          country?: string
          status?: string
          currency?: string
          onboarded?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          balance: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: number
          created_at?: string
        }
      }
      income_sources: {
        Row: {
          id: string
          user_id: string
          name: string
          monthly: number
          next_payday: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          monthly: number
          next_payday: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          monthly?: number
          next_payday?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          date: string
          account_id: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          date: string
          account_id: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          date?: string
          account_id?: string
          category?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          amount: number
          date: string
          recurring: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          amount: number
          date: string
          recurring?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          amount?: number
          date?: string
          recurring?: string | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          saved: number
          target: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          saved: number
          target: number
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          saved?: number
          target?: number
          color?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}
