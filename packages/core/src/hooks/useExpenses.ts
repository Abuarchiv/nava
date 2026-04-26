import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@nava/supabase'
import type {
  ExpenseWithSplits,
  Settlement,
  UserBalance,
  SettlementSuggestion,
  CreateExpenseInput,
  CreateSettlementInput,
  WGMemberWithProfile,
} from '@nava/types'
import {
  getExpenses,
  createExpense,
  deleteExpense,
  createSettlement,
  getWgMembers,
} from '@nava/supabase'
import { calculateBalances, simplifyDebts } from '../utils/balance.js'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (wgId: string) => ['expenses', wgId] as const,
  settlements: (wgId: string) => ['settlements', wgId] as const,
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExpensesResult = {
  expenses: ExpenseWithSplits[]
  members: WGMemberWithProfile[]
  settlements: Settlement[]
  balances: UserBalance[]
  settlementSuggestions: SettlementSuggestion[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useExpenses(wgId: string, supabase: SupabaseClient) {
  return useQuery<ExpensesResult, Error>({
    queryKey: expenseKeys.list(wgId),
    queryFn: async (): Promise<ExpensesResult> => {
      const [expenses, members, settlementsResult] = await Promise.all([
        getExpenses(wgId, supabase),
        getWgMembers(wgId, supabase),
        supabase
          .from('settlements')
          .select('*')
          .eq('wg_id', wgId)
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (error) throw error
            return (data ?? []) as Settlement[]
          }),
      ])

      const balances = calculateBalances(expenses, members, settlementsResult)
      const settlementSuggestions = simplifyDebts(balances)

      return {
        expenses,
        members,
        settlements: settlementsResult,
        balances,
        settlementSuggestions,
      }
    },
    enabled: Boolean(wgId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateExpense(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof createExpense>>,
    Error,
    CreateExpenseInput
  >({
    mutationFn: (input) => createExpense(input, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.list(variables.wg_id),
      })
    },
  })
}

type DeleteExpenseVars = { id: string; wgId: string }

export function useDeleteExpense(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteExpenseVars>({
    mutationFn: ({ id }) => deleteExpense(id, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.list(variables.wgId),
      })
    },
  })
}

export function useCreateSettlement(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof createSettlement>>,
    Error,
    CreateSettlementInput
  >({
    mutationFn: (input) => createSettlement(input, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: expenseKeys.list(variables.wg_id),
      })
    },
  })
}
