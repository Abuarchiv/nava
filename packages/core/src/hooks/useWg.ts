import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@nava/supabase'
import type { WGWithMembers, WGMemberWithProfile } from '@nava/types'
import {
  getMyWgs,
  getWg,
  getWgMembers,
  createWg,
  createInviteLink,
} from '@nava/supabase'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const wgKeys = {
  all: ['wgs'] as const,
  mine: (userId: string) => ['wgs', 'mine', userId] as const,
  detail: (wgId: string) => ['wgs', wgId] as const,
  members: (wgId: string) => ['wgs', wgId, 'members'] as const,
} as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useMyWgs(userId: string, supabase: SupabaseClient) {
  return useQuery<WGWithMembers[], Error>({
    queryKey: wgKeys.mine(userId),
    queryFn: () => getMyWgs(userId, supabase),
    enabled: Boolean(userId),
  })
}

export function useWg(wgId: string, supabase: SupabaseClient) {
  return useQuery<WGWithMembers, Error>({
    queryKey: wgKeys.detail(wgId),
    queryFn: () => getWg(wgId, supabase),
    enabled: Boolean(wgId),
  })
}

export function useWgMembers(wgId: string, supabase: SupabaseClient) {
  return useQuery<WGMemberWithProfile[], Error>({
    queryKey: wgKeys.members(wgId),
    queryFn: () => getWgMembers(wgId, supabase),
    enabled: Boolean(wgId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

type CreateWgVars = {
  name: string
  description?: string
  userId: string
}

export function useCreateWg(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<Awaited<ReturnType<typeof createWg>>, Error, CreateWgVars>({
    mutationFn: ({ name, description, userId }) =>
      createWg(name, description, userId, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: wgKeys.mine(variables.userId) })
    },
  })
}

type CreateInviteLinkVars = {
  wgId: string
  userId: string
  options?: { expiresInDays?: number; maxUses?: number }
}

export function useCreateInviteLink(supabase: SupabaseClient) {
  return useMutation<
    Awaited<ReturnType<typeof createInviteLink>>,
    Error,
    CreateInviteLinkVars
  >({
    mutationFn: ({ wgId, userId, options }) =>
      createInviteLink(wgId, userId, supabase, options),
  })
}
