import type { SupabaseClient } from '../client'
import type { CreateExpenseInput, CreateSettlementInput, ExpenseWithSplits, UserBalance } from '@nava/types'

export async function getExpenses(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      *,
      profiles(*),
      expense_categories(*),
      expense_splits(*, profiles(*))
    `)
    .eq('wg_id', wgId)
    .order('paid_on', { ascending: false })

  if (error) throw error
  return data as ExpenseWithSplits[]
}

export async function createExpense(input: CreateExpenseInput, supabase: SupabaseClient) {
  const { splits, ...expenseData } = input

  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert(expenseData)
    .select()
    .single()

  if (expenseError) throw expenseError

  const { error: splitsError } = await supabase
    .from('expense_splits')
    .insert(splits.map((s) => ({ ...s, expense_id: expense.id })))

  if (splitsError) throw splitsError

  return expense
}

export async function deleteExpense(id: string, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getWgBalances(wgId: string, supabase: SupabaseClient): Promise<UserBalance[]> {
  const { data, error } = await supabase.rpc('calculate_wg_balances', { p_wg_id: wgId })

  if (error) throw error

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url')
    .in('id', (data ?? []).map((b: { user_id: string }) => b.user_id))

  if (profilesError) throw profilesError

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  return (data ?? []).map((b: { user_id: string; balance: number }) => {
    const profile = profileMap.get(b.user_id)
    return {
      userId: b.user_id,
      displayName: profile?.display_name ?? 'Unknown',
      avatarUrl: profile?.avatar_url ?? null,
      balance: b.balance,
    }
  })
}

export async function createSettlement(input: CreateSettlementInput, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('settlements')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}
