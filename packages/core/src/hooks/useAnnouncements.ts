import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@nava/supabase'
import type { AnnouncementWithProfile, CreateAnnouncementInput } from '@nava/types'
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
  pinAnnouncement,
} from '@nava/supabase'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const announcementKeys = {
  all: ['announcements'] as const,
  list: (wgId: string) => ['announcements', wgId] as const,
} as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useAnnouncements(wgId: string, supabase: SupabaseClient) {
  return useQuery<AnnouncementWithProfile[], Error>({
    queryKey: announcementKeys.list(wgId),
    queryFn: () => getAnnouncements(wgId, supabase),
    enabled: Boolean(wgId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateAnnouncement(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof createAnnouncement>>,
    Error,
    CreateAnnouncementInput
  >({
    mutationFn: (input) => createAnnouncement(input, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(variables.wg_id),
      })
    },
  })
}

type DeleteAnnouncementVars = { id: string; wgId: string }

export function useDeleteAnnouncement(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteAnnouncementVars>({
    mutationFn: ({ id }) => deleteAnnouncement(id, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(variables.wgId),
      })
    },
  })
}

type PinAnnouncementVars = { id: string; pinned: boolean; wgId: string }

export function usePinAnnouncement(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof pinAnnouncement>>,
    Error,
    PinAnnouncementVars
  >({
    mutationFn: ({ id, pinned }) => pinAnnouncement(id, pinned, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: announcementKeys.list(variables.wgId),
      })
    },
  })
}
