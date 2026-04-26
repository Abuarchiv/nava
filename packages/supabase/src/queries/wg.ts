import { randomUUID } from 'crypto'
import type { SupabaseClient } from '../client'
import type { WGWithMembers, WGMemberWithProfile } from '@nava/types'

export async function getMyWgs(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('wg_members')
    .select(`wgs(*, wg_members(*, profiles(*)))`)
    .eq('user_id', userId)

  if (error) throw error
  return (data ?? []).map((row) => row.wgs).filter(Boolean) as WGWithMembers[]
}

export async function getWg(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('wgs')
    .select(`
      *,
      wg_members(*, profiles(*))
    `)
    .eq('id', wgId)
    .single()

  if (error) throw error
  return data as WGWithMembers
}

export async function getWgMembers(wgId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('wg_members')
    .select(`*, profiles(*)`)
    .eq('wg_id', wgId)

  if (error) throw error
  return data as WGMemberWithProfile[]
}

export async function createWg(
  name: string,
  description: string | undefined,
  userId: string,
  supabase: SupabaseClient,
) {
  const { data: wg, error: wgError } = await supabase
    .from('wgs')
    .insert({ name, description, created_by: userId })
    .select()
    .single()

  if (wgError) throw wgError

  const { error: memberError } = await supabase
    .from('wg_members')
    .insert({ wg_id: wg.id, user_id: userId, role: 'admin' })

  if (memberError) throw memberError

  return wg
}

export async function createInviteLink(
  wgId: string,
  userId: string,
  supabase: SupabaseClient,
  options?: { expiresInDays?: number; maxUses?: number },
) {
  const token = randomUUID().replace(/-/g, '')

  const expiresAt = options?.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 86_400_000).toISOString()
    : null

  const { data, error } = await supabase
    .from('invite_links')
    .insert({
      wg_id: wgId,
      created_by: userId,
      token,
      expires_at: expiresAt,
      max_uses: options?.maxUses ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function joinWgByToken(token: string, userId: string, supabase: SupabaseClient) {
  const { data: invite, error: inviteError } = await supabase
    .from('invite_links')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError) throw inviteError

  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    throw new Error('Invite link has expired')
  }
  if (invite.max_uses !== null && invite.current_uses >= invite.max_uses) {
    throw new Error('Invite link has reached its maximum uses')
  }

  const { data: existing } = await supabase
    .from('wg_members')
    .select('id')
    .eq('wg_id', invite.wg_id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    return { wg_id: invite.wg_id, already_member: true }
  }

  const { error: memberError } = await supabase
    .from('wg_members')
    .insert({ wg_id: invite.wg_id, user_id: userId, role: 'member' })

  if (memberError) throw memberError

  await supabase
    .from('invite_links')
    .update({
      current_uses: invite.current_uses + 1,
      used_by: userId,
      used_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  return { wg_id: invite.wg_id, already_member: false }
}
