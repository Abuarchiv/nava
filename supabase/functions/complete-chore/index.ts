import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, corsResponse, corsError, handleOptions } from '../_shared/cors.ts'

interface CompleteChoreBody {
  assignmentId?: string
  userId?: string
  notes?: string
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

  let body: CompleteChoreBody
  try {
    body = await req.json()
  } catch {
    return corsError('Invalid JSON body', 400)
  }

  const { assignmentId, userId, notes } = body

  if (!assignmentId) return corsError('assignmentId is required', 400)
  if (!userId) return corsError('userId is required', 400)

  // Fetch the assignment to get chore_id
  const { data: assignment, error: assignmentError } = await supabase
    .from('chore_assignments')
    .select('id, chore_id, assigned_to, wg_id')
    .eq('id', assignmentId)
    .single()

  if (assignmentError || !assignment) return corsError('Assignment not found', 400)

  // Verify user is completing their own assignment (or is an admin)
  if (assignment.assigned_to !== user.id) {
    // Check if user is wg admin
    const { data: membership } = await supabase
      .from('wg_members')
      .select('role')
      .eq('wg_id', assignment.wg_id)
      .eq('user_id', user.id)
      .single()

    if (!membership || membership.role !== 'admin') {
      return corsError('Cannot complete another member\'s assignment', 403)
    }
  }

  const completedAt = new Date().toISOString()
  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. INSERT into chore_completions
  const { error: completionError } = await adminClient
    .from('chore_completions')
    .insert({
      assignment_id: assignmentId,
      chore_id: assignment.chore_id,
      completed_by: userId,
      completed_at: completedAt,
      notes: notes ?? null,
    })

  if (completionError) {
    console.error('Failed to insert chore_completion:', completionError)
    return corsError('Failed to record chore completion', 500)
  }

  // 2. UPDATE chores — last_completed_by + last_completed_at
  const { error: choreUpdateError } = await adminClient
    .from('chores')
    .update({
      last_completed_by: userId,
      last_completed_at: completedAt,
    })
    .eq('id', assignment.chore_id)

  if (choreUpdateError) {
    console.error('Failed to update chore:', choreUpdateError)
    // Non-fatal, continue to rotation
  }

  // 3. Call rotate_chore_assignment() RPC
  const { data: rpcData, error: rpcError } = await adminClient
    .rpc('rotate_chore_assignment', { p_assignment_id: assignmentId })

  if (rpcError) {
    console.error('Failed to rotate chore assignment:', rpcError)
    // Non-fatal: completion was recorded
    return corsResponse({ success: true, nextAssignee: null })
  }

  return corsResponse({
    success: true,
    nextAssignee: rpcData?.next_assignee_id ?? rpcData ?? null,
  })
})
