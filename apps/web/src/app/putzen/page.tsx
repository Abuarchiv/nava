import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, CalendarCheck } from 'lucide-react'
import Link from 'next/link'
import { ChoreCard } from '@/components/features/ChoreCard'

export default async function PutzenPage() {
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

  const { data: chores } = await supabase
    .from('chores')
    .select('*, profiles(display_name, avatar_url)')
    .eq('wg_id', wgId)
    .order('next_due', { ascending: true })

  const myChores = chores?.filter((c) => c.assigned_to === user.id) ?? []
  const otherChores = chores?.filter((c) => c.assigned_to !== user.id) ?? []

  const freqLabel: Record<string, string> = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    biweekly: 'Zweiwöchentlich',
    monthly: 'Monatlich',
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Putzplan</h1>
          <p className="text-sm text-gray-500">
            {myChores.length > 0 ? `${myChores.length} Aufgaben für dich` : 'Nichts fällig für dich'}
          </p>
        </div>
        <Link href="/putzen/neu" className="btn-primary text-sm px-3 py-2">
          <Plus className="w-4 h-4" />
          Aufgabe
        </Link>
      </div>

      {/* My chores */}
      {myChores.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Du bist dran</h2>
          <div className="space-y-2">
            {myChores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                profile={chore.profiles as { display_name: string; avatar_url: string | null } | null}
                isCurrentUser={true}
                freqLabel={freqLabel}
                userId={user.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other chores */}
      {otherChores.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {myChores.length > 0 ? 'Andere' : 'Alle Aufgaben'}
          </h2>
          <div className="space-y-2">
            {otherChores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                profile={chore.profiles as { display_name: string; avatar_url: string | null } | null}
                isCurrentUser={false}
                freqLabel={freqLabel}
                userId={user.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {(!chores || chores.length === 0) && (
        <div className="card text-center py-10">
          <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Noch kein Putzplan</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Leg Aufgaben an — Nava zeigt wer wann dran ist.
          </p>
          <Link href="/putzen/neu" className="btn-primary text-sm inline-flex">
            <Plus className="w-4 h-4" />
            Erste Aufgabe
          </Link>
        </div>
      )}
    </div>
  )
}
