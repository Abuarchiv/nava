'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { WG, WGMember, Profile } from '@/lib/types'

interface WgMemberWithProfile extends WGMember {
  profiles: Profile
}

interface WgContext {
  wgId: string | null
  wg: WG | null
  members: WgMemberWithProfile[]
  isAdmin: boolean
  isLoading: boolean
}

export function useWgContext(): WgContext {
  const params = useParams()
  const [state, setState] = useState<WgContext>({
    wgId: null,
    wg: null,
    members: [],
    isAdmin: false,
    isLoading: true,
  })

  // WG-ID aus URL-Params oder primary WG des Users
  const urlWgId = typeof params?.wgId === 'string' ? params.wgId : null

  useEffect(() => {
    const supabase = createClient()
    let cancelled = false

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          if (!cancelled) setState({ wgId: null, wg: null, members: [], isAdmin: false, isLoading: false })
          return
        }

        // WG-ID ermitteln: URL-Param bevorzugt, sonst erste Mitgliedschaft
        let resolvedWgId = urlWgId

        if (!resolvedWgId) {
          const { data: membership } = await supabase
            .from('wg_members')
            .select('wg_id')
            .eq('user_id', user.id)
            .order('joined_at', { ascending: true })
            .limit(1)
            .single()

          resolvedWgId = membership?.wg_id ?? null
        }

        if (!resolvedWgId) {
          if (!cancelled) setState({ wgId: null, wg: null, members: [], isAdmin: false, isLoading: false })
          return
        }

        const [{ data: wg }, { data: members }, { data: ownMembership }] = await Promise.all([
          supabase.from('wgs').select('*').eq('id', resolvedWgId).single(),
          supabase
            .from('wg_members')
            .select('*, profiles(*)')
            .eq('wg_id', resolvedWgId),
          supabase
            .from('wg_members')
            .select('role')
            .eq('wg_id', resolvedWgId)
            .eq('user_id', user.id)
            .single(),
        ])

        if (!cancelled) {
          setState({
            wgId: resolvedWgId,
            wg: wg ?? null,
            members: (members as WgMemberWithProfile[]) ?? [],
            isAdmin: ownMembership?.role === 'admin',
            isLoading: false,
          })
        }
      } catch {
        if (!cancelled) setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [urlWgId])

  return state
}
