'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, getInitials, getAvatarColor } from '@/lib/utils'

interface Balance {
  user_id: string
  balance: number
  display_name: string
  avatar_url: string | null
}

export default function AbrechnungPage() {
  const router = useRouter()
  const [balances, setBalances] = useState<Balance[]>([])
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [settlingId, setSettlingId] = useState<string | null>(null)
  const [done, setDone] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id')
        .eq('user_id', user.id)
        .limit(1)

      const wg = memberships?.[0]?.wg_id
      if (!wg) { router.push('/onboarding'); return }
      setWgId(wg)

      const { data: balanceData } = await supabase.rpc('calculate_wg_balances', { p_wg_id: wg })
      const { data: members } = await supabase
        .from('wg_members')
        .select('user_id, profiles(display_name, avatar_url)')
        .eq('wg_id', wg)

      const profileMap = new Map(
        (members ?? []).map((m) => [m.user_id, m.profiles as { display_name: string; avatar_url: string | null }])
      )

      const enriched = ((balanceData as { user_id: string; balance: number }[]) ?? [])
        .filter((b) => b.user_id !== user.id && Math.abs(b.balance) > 0.01)
        .map((b) => ({
          user_id: b.user_id,
          balance: b.balance,
          display_name: profileMap.get(b.user_id)?.display_name ?? 'Unbekannt',
          avatar_url: profileMap.get(b.user_id)?.avatar_url ?? null,
        }))

      setBalances(enriched)
      setLoading(false)
    }
    load()
  }, [router])

  async function settle(withUserId: string, amount: number) {
    if (!wgId || !userId) return
    setSettlingId(withUserId)
    const supabase = createClient()

    const isPayingOut = amount > 0 // I owe them
    await supabase.from('settlements').insert({
      wg_id: wgId,
      payer_id: isPayingOut ? userId : withUserId,
      payee_id: isPayingOut ? withUserId : userId,
      amount: Math.abs(amount),
      note: 'Abrechnung',
    })

    // Mark splits as settled
    const { data: splits } = await supabase
      .from('expense_splits')
      .select('id, expenses(paid_by)')
      .eq('user_id', isPayingOut ? userId : withUserId)
      .eq('settled', false)

    if (splits && splits.length > 0) {
      await supabase
        .from('expense_splits')
        .update({ settled: true })
        .in('id', splits.filter((s) => {
          const exp = s.expenses as { paid_by: string } | null
          return exp?.paid_by === (isPayingOut ? withUserId : userId)
        }).map((s) => s.id))
    }

    setDone((prev) => [...prev, withUserId])
    setSettlingId(null)
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6 flex items-center justify-center min-h-48">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ausgaben" className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Abrechnen</h1>
      </div>

      {balances.length === 0 ? (
        <div className="card text-center py-10">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Alles ausgeglichen!</p>
          <p className="text-sm text-gray-400 mt-1">Keine offenen Schulden in eurer WG.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {balances.map((b) => {
            const isDone = done.includes(b.user_id)
            const owesMe = -b.balance // negative balance from others = they owe me

            return (
              <div key={b.user_id} className={`card ${isDone ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(b.display_name)} flex items-center justify-center text-white text-sm font-semibold`}>
                    {getInitials(b.display_name)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{b.display_name}</p>
                    <p className={`text-sm font-medium ${owesMe > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {owesMe > 0
                        ? `schuldet dir ${formatCurrency(owesMe)}`
                        : `du schuldest ${formatCurrency(Math.abs(owesMe))}`}
                    </p>
                  </div>
                </div>

                {!isDone && (
                  <button
                    onClick={() => settle(b.user_id, b.balance)}
                    disabled={settlingId === b.user_id}
                    className="btn-primary text-sm w-full"
                  >
                    {settlingId === b.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Als bezahlt markieren'
                    )}
                  </button>
                )}

                {isDone && (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Abgerechnet
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
