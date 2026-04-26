import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import type { Database } from '@nava/types'
import type { CookieOptions } from '@supabase/ssr'

export function createBrowserClient() {
  return createSSRBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
  )
}

type CookieStore = {
  get(name: string): string | undefined
  set(name: string, value: string, options: CookieOptions): void
  delete(name: string, options: CookieOptions): void
}

export function createServerClient(cookieStore: CookieStore) {
  return createSSRServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)
        },
        set(name, value, options) {
          cookieStore.set(name, value, options)
        },
        remove(name, options) {
          cookieStore.delete(name, options)
        },
      },
    },
  )
}

export type SupabaseClient = ReturnType<typeof createBrowserClient>
