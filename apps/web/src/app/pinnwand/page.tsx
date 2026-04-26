import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Megaphone, Pin } from 'lucide-react'
import Link from 'next/link'

export default async function PinnwandPage() {
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

  const { data: announcements } = await supabase
    .from('announcements')
    .select('*, profiles(display_name)')
    .eq('wg_id', wgId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#1f1b16]">Pinnwand</h1>
          <p className="text-sm text-[#9a8f7c]">Ankündigungen für alle</p>
        </div>
      </div>

      <div className="space-y-3">
        {announcements && announcements.length > 0 ? (
          announcements.map((a) => {
            const author = a.profiles as { display_name: string } | null
            return (
              <div key={a.id} className="card">
                <div className="flex items-start gap-3">
                  {a.pinned && (
                    <Pin className="w-4 h-4 text-[#c4694a] mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#1f1b16] text-sm">{a.title}</p>
                    <p className="text-sm text-[#5c5447] mt-1 leading-relaxed">{a.body}</p>
                    <p className="text-[11px] text-[#9a8f7c] mt-2">
                      {author?.display_name ?? 'Unbekannt'} ·{' '}
                      {new Date(a.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="card text-center py-10">
            <Megaphone className="w-10 h-10 text-[#ddd4c2] mx-auto mb-3" />
            <p className="font-medium text-[#5c5447]">Noch keine Ankündigungen</p>
            <p className="text-sm text-[#9a8f7c] mt-1">
              Hier landen WG-Ankündigungen, Termine und wichtige Infos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
