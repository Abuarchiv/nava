import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/nav/Sidebar'
import { BottomNav } from '@/components/nav/BottomNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Profil + WG-Mitgliedschaft laden
  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('wg_members')
      .select('wg_id, wgs(name)')
      .eq('user_id', user.id)
      .limit(1),
  ])

  const wg = memberships?.[0]?.wgs as { name: string } | undefined
  const wgName = wg?.name ?? 'Meine WG'
  const userName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Unbekannt'

  return (
    <div className="min-h-screen bg-[#f7f3ec] flex">
      {/* Desktop Sidebar */}
      <Sidebar wgName={wgName} userName={userName} userEmail={user.email ?? ''} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#fdfbf6]/95 backdrop-blur-xl border-b border-[#ddd4c2] px-4 h-14 flex items-center justify-between">
          <span className="font-black text-[18px] text-[#1f1b16] tracking-[-0.03em]">nava</span>
          <span className="text-sm text-[#9a8f7c] font-medium truncate ml-3">{wgName}</span>
        </header>

        <main className="flex-1 pt-14 pb-20 lg:pt-0 lg:pb-0 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}
