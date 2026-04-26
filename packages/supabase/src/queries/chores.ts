import type { SupabaseClient } from '../client'
import type { CreateChoreInput, ChoreWithAssignments } from '@nava/types'

export async function getChores(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('chores')
    .select(`
      *,
      chore_assignments(
        *,
        profiles(*),
        chore_completions(*)
      )
    `)
    .eq('wg_id', wgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ChoreWithAssignments[]
}

export async function createChore(input: CreateChoreInput, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('chores')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function completeChore(
  assignmentId: string,
  userId: string,
  supabase: SupabaseClient,
) {
  const { data, error } = await supabase
    .from('chore_completions')
    .insert({ assignment_id: assignmentId, completed_by: userId })
    .select()
    .single()

  if (error) throw error

  // Update last_completed_by / last_completed_at on the parent chore
  const { data: assignment, error: assignError } = await supabase
    .from('chore_assignments')
    .select('chore_id')
    .eq('id', assignmentId)
    .single()

  if (assignError) throw assignError

  await supabase
    .from('chores')
    .update({ last_completed_by: userId, last_completed_at: data.completed_at })
    .eq('id', assignment.chore_id)

  return data
}

export async function deleteChore(id: string, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('chores')
    .delete()
    .eq('id', id)

  if (error) throw error
}
