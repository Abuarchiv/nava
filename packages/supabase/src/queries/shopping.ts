import type { SupabaseClient } from '../client'
import type { AddShoppingItemInput, ShoppingItemWithProfiles } from '@nava/types'

export async function getShoppingItems(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('shopping_items')
    .select(`
      *,
      added_by_profile:profiles!shopping_items_added_by_fkey(*),
      bought_by_profile:profiles!shopping_items_bought_by_fkey(*)
    `)
    .eq('wg_id', wgId)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ShoppingItemWithProfiles[]
}

export async function addShoppingItem(input: AddShoppingItemInput, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({ ...input, status: 'pending' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markAsBought(itemId: string, buyerId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('shopping_items')
    .update({ bought_by: buyerId, status: 'purchased', updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteShoppingItem(id: string, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('shopping_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
