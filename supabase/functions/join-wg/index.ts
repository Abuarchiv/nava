import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, corsResponse, corsError, handleOptions } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return corsError('Missing authorization header', 401)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )

  // Verify JWT and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return corsError('Unauthorized', 401)

  let body: { token?: string }
  try {
    body = await req.json()
  } catch {
    return corsError('Invalid JSON body', 400)
  }

  const { token } = body
  if (!token) return corsError('token is required', 400)

  // 1. Find invite link by token
  const { data: invite, error: inviteError } = await supabase
    .from('invite_links')
    .select('id, wg_id, expires_at, max_uses, current_uses, wgs(id, name)')
    .eq('token', token)
    .single()

  if (inviteError || !invite) return corsError('Invalid invite token', 400)

  // 2. Check expiry
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return corsError('Invite link has expired', 400)
  }

  // 3. Check max uses
  if (invite.max_uses !== null && invite.current_uses >= invite.max_uses) {
    return corsError('Invite link has reached maximum uses', 400)
  }

  // 4. Check if user is already a member
  const { data: existingMember } = await supabase
    .from('wg_members')
    .select('id')
    .eq('wg_id', invite.wg_id)
    .eq('user_id', user.id)
    .single()

  if (existingMember) return corsError('Already a member of this WG', 400)

  // 5. Add user as wg_member
  const { error: memberError } = await supabase
    .from('wg_members')
    .insert({ wg_id: invite.wg_id, user_id: user.id, role: 'member' })

  if (memberError) {
    console.error('Failed to add member:', memberError)
    return corsError('Failed to join WG', 500)
  }

  // 6. Update invite_links: current_uses, used_by, used_at
  const { error: updateError } = await supabase
    .from('invite_links')
    .update({
      current_uses: invite.current_uses + 1,
      used_by: user.id,
      used_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (updateError) {
    console.error('Failed to update invite link:', updateError)
    // Non-fatal: member was added, just log the error
  }

  const wg = invite.wgs as { id: string; name: string } | null

  return corsResponse({
    success: true,
    wgId: invite.wg_id,
    wgName: wg?.name ?? null,
  })
})
