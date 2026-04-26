import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, corsResponse, corsError, handleOptions } from '../_shared/cors.ts'

interface Split {
  userId: string
  shareAmount: number
}

interface CreateExpenseBody {
  wgId?: string
  description?: string
  amount?: number
  categoryId?: string
  paidBy?: string
  splits?: Split[]
  paidOn?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return corsError('Missing authorization header', 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return corsError('Unauthorized', 401)

  let body: CreateExpenseBody
  try {
    body = await req.json()
  } catch {
    return corsError('Invalid JSON body', 400)
  }

  const { wgId, description, amount, categoryId, paidBy, splits, paidOn } = body

  // Validate required fields
  if (!wgId) return corsError('wgId is required', 400)
  if (!description) return corsError('description is required', 400)
  if (amount === undefined || amount === null) return corsError('amount is required', 400)
  if (typeof amount !== 'number' || amount <= 0) return corsError('amount must be a positive number', 400)
  if (!paidBy) return corsError('paidBy is required', 400)
  if (!splits || !Array.isArray(splits) || splits.length === 0) return corsError('splits is required and must be non-empty', 400)

  // Validate splits sum to amount (allow small floating point tolerance)
  const splitsTotal = splits.reduce((sum, s) => sum + s.shareAmount, 0)
  if (Math.abs(splitsTotal - amount) > 0.01) {
    return corsError(`splits total (${splitsTotal}) must equal amount (${amount})`, 400)
  }

  // Verify user is member of WG
  const { data: membership } = await supabase
    .from('wg_members')
    .select('id')
    .eq('wg_id', wgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return corsError('Not a member of this WG', 403)

  // Atomic transaction: insert expense then splits using service role for RPC
  // Use admin client for the transaction
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Insert expense
  const { data: expense, error: expenseError } = await adminClient
    .from('expenses')
    .insert({
      wg_id: wgId,
      description,
      amount,
      category_id: categoryId ?? null,
      paid_by: paidBy,
      paid_on: paidOn ?? new Date().toISOString(),
      created_by: user.id,
    })
    .select('id')
    .single()

  if (expenseError || !expense) {
    console.error('Failed to insert expense:', expenseError)
    return corsError('Failed to create expense', 500)
  }

  // Insert splits
  const splitRows = splits.map((s) => ({
    expense_id: expense.id,
    user_id: s.userId,
    share_amount: s.shareAmount,
  }))

  const { error: splitsError } = await adminClient
    .from('expense_splits')
    .insert(splitRows)

  if (splitsError) {
    console.error('Failed to insert splits, rolling back expense:', splitsError)
    // Rollback: delete the expense
    await adminClient.from('expenses').delete().eq('id', expense.id)
    return corsError('Failed to create expense splits', 500)
  }

  return corsResponse({ expenseId: expense.id })
})
