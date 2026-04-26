import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { SupabaseClient } from '@nava/supabase'
import type { ShoppingItemWithProfiles, AddShoppingItemInput } from '@nava/types'
import {
  getShoppingItems,
  addShoppingItem,
  markAsBought,
  deleteShoppingItem,
} from '@nava/supabase'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const shoppingKeys = {
  all: ['shopping'] as const,
  list: (wgId: string) => ['shopping', wgId] as const,
} as const

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useShoppingItems(wgId: string, supabase: SupabaseClient) {
  return useQuery<ShoppingItemWithProfiles[], Error>({
    queryKey: shoppingKeys.list(wgId),
    queryFn: () => getShoppingItems(wgId, supabase),
    enabled: Boolean(wgId),
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAddShoppingItem(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof addShoppingItem>>,
    Error,
    AddShoppingItemInput
  >({
    mutationFn: (input) => addShoppingItem(input, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: shoppingKeys.list(variables.wg_id),
      })
    },
  })
}

type MarkAsBoughtVars = { itemId: string; buyerId: string; wgId: string }

export function useMarkAsBought(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<
    Awaited<ReturnType<typeof markAsBought>>,
    Error,
    MarkAsBoughtVars
  >({
    mutationFn: ({ itemId, buyerId }) => markAsBought(itemId, buyerId, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: shoppingKeys.list(variables.wgId),
      })
    },
  })
}

type DeleteShoppingItemVars = { id: string; wgId: string }

export function useDeleteShoppingItem(supabase: SupabaseClient) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteShoppingItemVars>({
    mutationFn: ({ id }) => deleteShoppingItem(id, supabase),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: shoppingKeys.list(variables.wgId),
      })
    },
  })
}
