import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, corsResponse, corsError, handleOptions } from '../_shared/cors.ts'

type NotificationType = 'expense' | 'chore' | 'shopping' | 'announcement'

interface SendNotificationBody {
  wgId?: string
  type?: NotificationType
  title?: string
  body?: string
  data?: Record<string, unknown>
}

interface ExpoMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  sound?: 'default'
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const BATCH_SIZE = 100

async function sendExpoBatch(messages: ExpoMessage[]): Promise<void> {
  const res = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(messages),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Expo push API error ${res.status}: ${text}`)
  }
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

  let body: SendNotificationBody
  try {
    body = await req.json()
  } catch {
    return corsError('Invalid JSON body', 400)
  }

  const { wgId, type, title, body: notifBody, data } = body

  if (!wgId) return corsError('wgId is required', 400)
  if (!type) return corsError('type is required', 400)
  if (!['expense', 'chore', 'shopping', 'announcement'].includes(type)) {
    return corsError('type must be one of: expense, chore, shopping, announcement', 400)
  }
  if (!title) return corsError('title is required', 400)
  if (!notifBody) return corsError('body is required', 400)

  // Verify sender is WG member
  const { data: membership } = await supabase
    .from('wg_members')
    .select('id')
    .eq('wg_id', wgId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return corsError('Not a member of this WG', 403)

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // 1. Load WG members (excluding sender), then fetch their push tokens
  const { data: members } = await adminClient
    .from('wg_members')
    .select('user_id')
    .eq('wg_id', wgId)
    .neq('user_id', user.id)

  const memberIds = (members ?? []).map((m: { user_id: string }) => m.user_id)

  if (memberIds.length === 0) {
    return corsResponse({ sent: 0 })
  }

  const { data: tokens, error: tokensError } = await adminClient
    .from('push_tokens')
    .select('token, enabled_types')
    .in('user_id', memberIds)

  if (tokensError) {
    console.error('Failed to load push tokens:', tokensError)
    return corsError('Failed to load push tokens', 500)
  }

  // Filter tokens where this notification type is enabled
  const filteredTokens = (tokens ?? [])
    .filter((row: { token: string; enabled_types: string[] | null }) => {
      if (!row.enabled_types) return true // null = all enabled
      return row.enabled_types.includes(type)
    })
    .map((row: { token: string }) => row.token)
    .filter((t: string) => t && t.startsWith('ExponentPushToken['))

  if (filteredTokens.length === 0) {
    return corsResponse({ sent: 0 })
  }

  // 2. Batch send to Expo Push API (max 100 per batch)
  const batches: string[][] = []
  for (let i = 0; i < filteredTokens.length; i += BATCH_SIZE) {
    batches.push(filteredTokens.slice(i, i + BATCH_SIZE))
  }

  let sent = 0
  const errors: string[] = []

  for (const batch of batches) {
    const messages: ExpoMessage[] = batch.map((token) => ({
      to: token,
      title,
      body: notifBody,
      sound: 'default',
      ...(data ? { data } : {}),
    }))

    try {
      await sendExpoBatch(messages)
      sent += batch.length
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Expo batch error:', msg)
      errors.push(msg)
    }
  }

  if (errors.length > 0 && sent === 0) {
    return corsError(`All notification batches failed: ${errors[0]}`, 500)
  }

  return corsResponse({ sent, errors: errors.length > 0 ? errors : undefined })
})
