export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          phone: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wgs: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
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
          role: Database['public']['Enums']['wg_member_role']
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          user_id: string
          role?: Database['public']['Enums']['wg_member_role']
          joined_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          user_id?: string
          role?: Database['public']['Enums']['wg_member_role']
          joined_at?: string
          updated_at?: string
        }
      }
      invite_links: {
        Row: {
          id: string
          wg_id: string
          created_by: string
          token: string
          used_by: string | null
          used_at: string | null
          expires_at: string | null
          max_uses: number | null
          current_uses: number
        }
        Insert: {
          id?: string
          wg_id: string
          created_by: string
          token: string
          used_by?: string | null
          used_at?: string | null
          expires_at?: string | null
          max_uses?: number | null
          current_uses?: number
        }
        Update: {
          id?: string
          wg_id?: string
          created_by?: string
          token?: string
          used_by?: string | null
          used_at?: string | null
          expires_at?: string | null
          max_uses?: number | null
          current_uses?: number
        }
      }
      expense_categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      expenses: {
        Row: {
          id: string
          wg_id: string
          paid_by: string
          category_id: string | null
          description: string
          amount: number
          payment_method: string | null
          paid_on: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          paid_by: string
          category_id?: string | null
          description: string
          amount: number
          payment_method?: string | null
          paid_on: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          paid_by?: string
          category_id?: string | null
          description?: string
          amount?: number
          payment_method?: string | null
          paid_on?: string
          created_at?: string
          updated_at?: string
        }
      }
      expense_splits: {
        Row: {
          id: string
          expense_id: string
          user_id: string
          share_amount: number
          is_equal_split: boolean
        }
        Insert: {
          id?: string
          expense_id: string
          user_id: string
          share_amount: number
          is_equal_split?: boolean
        }
        Update: {
          id?: string
          expense_id?: string
          user_id?: string
          share_amount?: number
          is_equal_split?: boolean
        }
      }
      settlements: {
        Row: {
          id: string
          wg_id: string
          from_user: string
          to_user: string
          amount: number
          description: string | null
          settled_at: string
          created_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          from_user: string
          to_user: string
          amount: number
          description?: string | null
          settled_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          from_user?: string
          to_user?: string
          amount?: number
          description?: string | null
          settled_at?: string
          created_at?: string
        }
      }
      chores: {
        Row: {
          id: string
          wg_id: string
          name: string
          description: string | null
          frequency: Database['public']['Enums']['chore_frequency']
          assigned_to: string | null
          due_date: string | null
          last_completed_by: string | null
          last_completed_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          name: string
          description?: string | null
          frequency: Database['public']['Enums']['chore_frequency']
          assigned_to?: string | null
          due_date?: string | null
          last_completed_by?: string | null
          last_completed_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          name?: string
          description?: string | null
          frequency?: Database['public']['Enums']['chore_frequency']
          assigned_to?: string | null
          due_date?: string | null
          last_completed_by?: string | null
          last_completed_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chore_assignments: {
        Row: {
          id: string
          chore_id: string
          user_id: string
          assigned_on: string
          due_on: string
          rotation_order: number | null
        }
        Insert: {
          id?: string
          chore_id: string
          user_id: string
          assigned_on: string
          due_on: string
          rotation_order?: number | null
        }
        Update: {
          id?: string
          chore_id?: string
          user_id?: string
          assigned_on?: string
          due_on?: string
          rotation_order?: number | null
        }
      }
      chore_completions: {
        Row: {
          id: string
          assignment_id: string
          completed_by: string
          completed_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          assignment_id: string
          completed_by: string
          completed_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          assignment_id?: string
          completed_by?: string
          completed_at?: string
          notes?: string | null
        }
      }
      shopping_items: {
        Row: {
          id: string
          wg_id: string
          name: string
          category: string | null
          quantity: number | null
          unit: string | null
          added_by: string
          bought_by: string | null
          expense_id: string | null
          status: Database['public']['Enums']['shopping_status']
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          name: string
          category?: string | null
          quantity?: number | null
          unit?: string | null
          added_by: string
          bought_by?: string | null
          expense_id?: string | null
          status?: Database['public']['Enums']['shopping_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          name?: string
          category?: string | null
          quantity?: number | null
          unit?: string | null
          added_by?: string
          bought_by?: string | null
          expense_id?: string | null
          status?: Database['public']['Enums']['shopping_status']
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          wg_id: string
          posted_by: string
          title: string
          content: string
          pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wg_id: string
          posted_by: string
          title: string
          content: string
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wg_id?: string
          posted_by?: string
          title?: string
          content?: string
          pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          token: string
          device_type: Database['public']['Enums']['device_type']
          device_name: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          device_type: Database['public']['Enums']['device_type']
          device_name?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          device_type?: Database['public']['Enums']['device_type']
          device_name?: string | null
          is_active?: boolean
        }
      }
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          wg_id: string
          expenses_enabled: boolean
          chores_enabled: boolean
          shopping_enabled: boolean
          announcements_enabled: boolean
          digest_frequency: Database['public']['Enums']['digest_frequency']
        }
        Insert: {
          id?: string
          user_id: string
          wg_id: string
          expenses_enabled?: boolean
          chores_enabled?: boolean
          shopping_enabled?: boolean
          announcements_enabled?: boolean
          digest_frequency?: Database['public']['Enums']['digest_frequency']
        }
        Update: {
          id?: string
          user_id?: string
          wg_id?: string
          expenses_enabled?: boolean
          chores_enabled?: boolean
          shopping_enabled?: boolean
          announcements_enabled?: boolean
          digest_frequency?: Database['public']['Enums']['digest_frequency']
        }
      }
    }
    Functions: {
      calculate_wg_balances: {
        Args: { p_wg_id: string }
        Returns: { user_id: string; balance: number }[]
      }
    }
    Enums: {
      wg_member_role: 'admin' | 'member'
      chore_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
      shopping_status: 'pending' | 'purchased' | 'archived'
      device_type: 'ios' | 'android' | 'web'
      digest_frequency: 'instant' | 'daily' | 'weekly' | 'disabled'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
