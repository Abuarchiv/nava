import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders, corsResponse, corsError, handleOptions } from '../_shared/cors.ts'

interface AuthWebhookRecord {
  id: string
  email: string
  raw_user_meta_data?: {
    name?: string
    full_name?: string
    avatar_url?: string
    picture?: string
    [key: string]: unknown
  }
  created_at?: string
}

interface AuthWebhookBody {
  type?: string
  table?: string
  record?: AuthWebhookRecord
  schema?: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return handleOptions()

  // Webhook secret check — Supabase sends this as Authorization: Bearer <webhook_secret>
  const webhookSecret = Deno.env.get('WEBHOOK_SECRET')
  if (webhookSecret) {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (token !== webhookSecret) return corsError('Unauthorized', 401)
  }

  let body: AuthWebhookBody
  try {
    body = await req.json()
  } catch {
    return corsError('Invalid JSON body', 400)
  }

  // Only handle INSERT events on the users table
  if (body.type !== 'INSERT' || body.table !== 'users') {
    return corsResponse({ skipped: true })
  }

  const record = body.record
  if (!record?.id) return corsError('Missing user record', 400)

  const adminClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const meta = record.raw_user_meta_data ?? {}
  const displayName = meta.full_name ?? meta.name ?? record.email?.split('@')[0] ?? null
  const avatarUrl = meta.avatar_url ?? meta.picture ?? null

  // Insert into public.profiles — use upsert to be idempotent
  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert(
      {
        id: record.id,
        email: record.email,
        display_name: displayName,
        avatar_url: avatarUrl,
        created_at: record.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    )

  if (profileError) {
    console.error('Failed to create profile for user', record.id, profileError)
    return corsError('Failed to create profile', 500)
  }

  return corsResponse({ success: true, userId: record.id })
})
