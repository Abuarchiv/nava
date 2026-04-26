import type { SupabaseClient } from '../client'
import type { CreateAnnouncementInput, AnnouncementWithProfile } from '@nava/types'

export async function getAnnouncements(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('announcements')
    .select(`*, profiles(*)`)
    .eq('wg_id', wgId)
    // pinned first, then newest
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as AnnouncementWithProfile[]
}

export async function createAnnouncement(input: CreateAnnouncementInput, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('announcements')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAnnouncement(id: string, supabase: SupabaseClient) {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function pinAnnouncement(id: string, pinned: boolean, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('announcements')
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
