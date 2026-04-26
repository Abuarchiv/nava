import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency, getInitials, getAvatarColor, formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

export default async function AusgabenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('wg_members')
    .select('wg_id')
    .eq('user_id', user.id)
    .limit(1)

  const wgId = memberships?.[0]?.wg_id
  if (!wgId) redirect('/onboarding')

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*, profiles(display_name, avatar_url), expense_splits(*)')
    .eq('wg_id', wgId)
    .order('created_at', { ascending: false })

  const { data: balanceData } = await supabase.rpc('calculate_wg_balances', { p_wg_id: wgId })
  const balances = (balanceData as { user_id: string; balance: number }[] | null) ?? []

  const { data: members } = await supabase
    .from('wg_members')
    .select('user_id, profiles(display_name, avatar_url)')
    .eq('wg_id', wgId)

  const myBalance = balances.find((b) => b.user_id === user.id)?.balance ?? 0

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Ausgaben</h1>
          <p className="text-sm text-gray-500">
            Dein Saldo:{' '}
            <span className={myBalance >= 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
              {myBalance >= 0 ? '+' : ''}{formatCurrency(myBalance)}
            </span>
          </p>
        </div>
        <Link href="/ausgaben/neu" className="btn-primary text-sm px-3 py-2">
          <Plus className="w-4 h-4" />
          Neu
        </Link>
      </div>

      {/* Balances per Person */}
      {members && members.length > 1 && (
        <div className="card mb-5">
          <h2 className="font-semibold text-gray-900 mb-3 text-sm">Wer schuldet wem was</h2>
          <div className="space-y-3">
            {balances
              .filter((b) => b.user_id !== user.id && Math.abs(b.balance) > 0.01)
              .map((b) => {
                const member = members.find((m) => m.user_id === b.user_id)
                const profile = member?.profiles as { display_name: string; avatar_url: string | null } | null
                const name = profile?.display_name ?? 'Unbekannt'
                // b.balance from their perspective = negative means they owe us
                // We need the inverse: if their balance is -10, they owe us 10
                const owesMe = -b.balance
                return (
                  <div key={b.user_id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                      {getInitials(name)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{name}</p>
                    </div>
                    {owesMe > 0.01 ? (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span className="text-sm font-semibold">{formatCurrency(owesMe)}</span>
                      </div>
                    ) : owesMe < -0.01 ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-sm font-semibold">{formatCurrency(Math.abs(owesMe))}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Quitt</span>
                    )}
                  </div>
                )
              })}
            {balances.filter((b) => b.user_id !== user.id && Math.abs(b.balance) > 0.01).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-2">Alle sind quitt. 🎉</p>
            )}
          </div>

          {balances.some((b) => b.user_id !== user.id && Math.abs(b.balance) > 0.01) && (
            <Link href="/ausgaben/abrechnen" className="btn-primary text-sm w-full mt-3">
              Abrechnen
            </Link>
          )}
        </div>
      )}

      {/* Expense List */}
      <div className="space-y-3">
        {expenses && expenses.length > 0 ? (
          expenses.map((e) => {
            const payer = e.profiles as { display_name: string; avatar_url: string | null }
            const isMe = e.paid_by === user.id
            const name = payer?.display_name ?? 'Unbekannt'
            return (
              <Link
                key={e.id}
                href={`/ausgaben/${e.id}`}
                className="card block hover:border-[#3d5a3d] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500">
                      {isMe ? 'Du' : name} · {formatRelativeDate(e.date ?? e.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(e.amount)}</p>
                    <p className="text-xs text-gray-400">
                      {(e.expense_splits as unknown[]).length} Personen
                    </p>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="card text-center py-10">
            <p className="text-3xl mb-3">💸</p>
            <p className="font-medium text-gray-700">Noch keine Ausgaben</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Wer hat zuletzt eingekauft? Trag es ein.
            </p>
            <Link href="/ausgaben/neu" className="btn-primary text-sm inline-flex">
              <Plus className="w-4 h-4" />
              Erste Ausgabe
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
