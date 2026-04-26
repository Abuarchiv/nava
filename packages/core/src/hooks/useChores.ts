import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@nava/supabase'
import type { ChoreWithAssignments, CreateChoreInput } from '@nava/types'
import { getChores, createChore, completeChore, deleteChore } from '@nava/supabase'
import { isOverdue } from '../utils/date.js'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const choreKeys = {
  all: ['chores'] as const,
  list: (wgId: string) => ['chores', wgId] as const,
} as const

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChoresResult = {
  chores: ChoreWithAssignments[]
  overdueChores: ChoreWithAssignments[]
  myChores: (userId: string) => ChoreWithAssignments[]
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useChores(wgId: string, supabase: SupabaseClient) {
  return useQuery<ChoresResult, Error>({
    queryKey: choreKeys.list(wgId),
    queryFn: async (): Promise<ChoresResult> => {
      const chores = await getChores(wgId, supabase)

      const overdueChores = chores.filter((chore) => {
        const latestDue = chore.chore_assignments
          .map((a) => a.due_on)
          .filter(Boolean)
          .sort()
          .at(-1)

        return latestDue ? isOverdue(latestDue) : false
      })

      const myChores = (userId: string): ChoreWithAssignments[] =>
        chores.filter((chore) =>
          chore.chore_assignments.some((a) => a.user_id === userId),
        )

      return { chores, overdueChores, myChores }
    },
    enabled: Boolean(wgId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateChore(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof createChore>>,
    Error,
    CreateChoreInput
  >({
    mutationFn: (input) => createChore(input, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: choreKeys.list(variables.wg_id),
      })
    },
  })
}

type CompleteChoreVars = { assignmentId: string; userId: string; wgId: string }

export function useCompleteChore(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof completeChore>>,
    Error,
    CompleteChoreVars
  >({
    mutationFn: ({ assignmentId, userId }) =>
      completeChore(assignmentId, userId, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: choreKeys.list(variables.wgId),
      })
    },
  })
}

type DeleteChoreVars = { id: string; wgId: string }

export function useDeleteChore(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteChoreVars>({
    mutationFn: ({ id }) => deleteChore(id, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: choreKeys.list(variables.wgId),
      })
    },
  })
}
