// Re-export database types
// In production, these are generated from Supabase schema
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          phone: string | null
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string
          avatar_url?: string | null
          phone?: string | null
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          phone?: string | null
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      wgs: {
        Row: {
          id: string
          name: string
          address: string | null
          description: string | null
          avatar_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          description?: string | null
          avatar_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      wg_members: {
        Row: {
          id: string
          wg_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          wg_id: string
          paid_by: string
          category_id: string | null
          title: string
          amount: number
          paid_on: string
          receipt_url: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          paid_by: string
          category_id?: string | null
          title: string
          amount: number
          paid_on?: string
          receipt_url?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          paid_by?: string
          category_id?: string | null
          title?: string
          amount?: number
          paid_on?: string
          receipt_url?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          amount: number
          settled: boolean
          created_at: string
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          amount: number
          settled?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          amount?: number
          settled?: boolean
          created_at?: string
        }
      }
      settlements: {
        Row: {
          id: string
          wg_id: string
          payer_id: string
          payee_id: string
          amount: number
          note: string | null
          settled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          payer_id: string
          payee_id: string
          amount: number
          note?: string | null
          settled_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          payer_id?: string
          payee_id?: string
          amount?: number
          note?: string | null
          settled_at?: string
          created_at?: string
        }
      }
      chores: {
        Row: {
          id: string
          wg_id: string
          title: string
          description: string | null
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          assigned_to: string | null
          next_due: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          title: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          assigned_to?: string | null
          next_due?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          title?: string
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          assigned_to?: string | null
          next_due?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      shopping_items: {
        Row: {
          id: string
          wg_id: string
          name: string
          quantity: string | null
          added_by: string
          status: 'pending' | 'purchased' | 'archived'
          purchased_by: string | null
          purchased_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          name: string
          quantity?: string | null
          added_by: string
          status?: 'pending' | 'purchased' | 'archived'
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          name?: string
          quantity?: string | null
          added_by?: string
          status?: 'pending' | 'purchased' | 'archived'
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invite_links: {
        Row: {
          id: string
          wg_id: string
          token: string
          created_by: string
          expires_at: string | null
          max_uses: number | null
          use_count: number
          created_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          token?: string
          created_by: string
          expires_at?: string | null
          max_uses?: number | null
          use_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          token?: string
          created_by?: string
          expires_at?: string | null
          max_uses?: number | null
          use_count?: number
          created_at?: string
        }
      }
      expense_categories: {
        Row: {
          id: string
          wg_id: string | null
          name: string
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wg_id?: string | null
          name: string
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          wg_id?: string | null
          name?: string
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      calculate_wg_balances: {
        Args: { p_wg_id: string }
        Returns: { user_id: string; balance: number }[]
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type WG = Database['public']['Tables']['wgs']['Row']
export type WGMember = Database['public']['Tables']['wg_members']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type ExpenseSplit = Database['public']['Tables']['expense_splits']['Row']
export type Settlement = Database['public']['Tables']['settlements']['Row']
export type Chore = Database['public']['Tables']['chores']['Row']
export type ShoppingItem = Database['public']['Tables']['shopping_items']['Row']
export type InviteLink = Database['public']['Tables']['invite_links']['Row']
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row']

export interface UserBalance {
  userId: string
  displayName: string
  avatarUrl: string | null
  balance: number
}

export interface ExpenseWithSplits extends Expense {
  profiles: Profile
  expense_categories: ExpenseCategory | null
  expense_splits: (ExpenseSplit & { profiles: Profile })[]
}

export interface ChoreWithAssignee extends Chore {
  profiles: Profile | null
}
