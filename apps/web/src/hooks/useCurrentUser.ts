'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, WGMember } from '@/lib/types'

interface CurrentUser {
  user: { id: string; email: string } | null
  profile: Profile | null
  wgId: string | null
  wgMembership: WGMember | null
  isLoading: boolean
}

export function useCurrentUser(): CurrentUser {
  const [state, setState] = useState<CurrentUser>({
    user: null,
    profile: null,
    wgId: null,
    wgMembership: null,
    isLoading: true,
  })

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (!cancelled) {
            setState({ user: null, profile: null, wgId: null, wgMembership: null, isLoading: false })
          }
          return
        }

        const [{ data: profile }, { data: membership }] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', user.id).single(),
          supabase
            .from('wg_members')
            .select('*')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single(),
        ])

        if (!cancelled) {
          setState({
            user: { id: user.id, email: user.email ?? '' },
            profile: profile ?? null,
            wgId: membership?.wg_id ?? null,
            wgMembership: membership ?? null,
            isLoading: false,
          })
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    void load()

    // Auth-State Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load()
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  return state
}
