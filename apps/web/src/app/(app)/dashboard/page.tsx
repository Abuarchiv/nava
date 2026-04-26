import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  ShoppingCart,
  Users,
  Euro,
  CalendarCheck,
  Megaphone,
  Settings,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils'
import { MemberList } from '@/components/dashboard/MemberList'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // WG-Mitgliedschaft laden
  const { data: memberships } = await supabase
    .from('wg_members')
    .select('wg_id, role, wgs(id, name, address)')
    .eq('user_id', user.id)
    .limit(1)

  const membership = memberships?.[0]
  const wg = membership?.wgs as { id: string; name: string; address: string | null } | undefined

  if (!wg) redirect('/onboarding')

  const wgId = wg.id

  // Profil laden
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'du'
  const vorname = displayName.split(' ')[0]

  // Greeting abhängig von Tageszeit
  const stunde = new Date().getHours()
  const greeting =
    stunde < 12 ? 'Guten Morgen' : stunde < 18 ? 'Guten Tag' : 'Guten Abend'

  // Stats parallel laden
  const [
    { data: balanceData },
    { count: offeneChores },
    { count: pendingItems },
    { data: members },
    { data: recentExpenses },
  ] = await Promise.all([
    supabase.rpc('calculate_wg_balances', { p_wg_id: wgId }),
    supabase
      .from('chores')
      .select('id', { count: 'exact', head: true })
      .eq('wg_id', wgId)
      .eq('is_active', true),
    supabase
      .from('shopping_items')
      .select('id', { count: 'exact', head: true })
      .eq('wg_id', wgId)
      .eq('status', 'pending'),
    supabase
      .from('wg_members')
      .select('id, user_id, role, profiles(display_name, avatar_url)')
      .eq('wg_id', wgId),
    supabase
      .from('expenses')
      .select('id, title, amount, date, profiles(display_name)')
      .eq('wg_id', wgId)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  // recentExpenses aktuell nicht im UI verwendet — bewusst geladen für künftigen Activity-Feed
  void recentExpenses

  // Gesamtschulden: Summe aller negativen Salden (was WG-intern offen ist)
  const balances = (
    balanceData as { user_id: string; balance: number }[] | null
  ) ?? []

  const gesamtSchulden = balances
    .filter((b) => b.balance < 0)
    .reduce((sum, b) => sum + Math.abs(b.balance), 0)

  const myBalance = balances.find((b) => b.user_id === user.id)?.balance ?? 0

  // Member-Daten für MemberList aufbereiten
  const membersMapped = (members ?? []).map((m) => {
    const p = m.profiles as { display_name: string; avatar_url: string | null } | null
    const balance = balances.find((b) => b.user_id === m.user_id)?.balance ?? 0
    return {
      id: m.id,
      userId: m.user_id,
      displayName: p?.display_name ?? 'Unbekannt',
      avatarUrl: p?.avatar_url ?? null,
      balance,
    }
  })

  const faelligeChores = offeneChores ?? 0
  const offenItems = pendingItems ?? 0

  const stats: { label: string; value: string; sub: string; color: string }[] = [
    {
      label: 'Offene Schulden',
      value: formatCurrency(gesamtSchulden),
      sub: 'in der WG',
      color: gesamtSchulden > 0 ? 'text-[#a03b2d]' : 'text-[#3d5a3d]',
    },
    {
      label: 'Chores fällig',
      value: String(faelligeChores),
      sub: faelligeChores === 1 ? 'Aufgabe' : 'Aufgaben',
      color: faelligeChores > 0 ? 'text-[#b45309]' : 'text-[#3d5a3d]',
    },
    {
      label: 'Einkauf',
      value: String(offenItems),
      sub: 'Artikel offen',
      color: 'text-[#1f1b16]',
    },
  ]

  const shortcuts: {
    href: string
    Icon: typeof Euro
    label: string
    sub: string
    color: string
    iconColor: string
  }[] = [
    {
      href: '/ausgaben',
      Icon: Euro,
      label: 'Ausgaben',
      sub: 'Kosten teilen & abrechnen',
      color: 'bg-[#e8ede3]',
      iconColor: 'text-[#3d5a3d]',
    },
    {
      href: '/putzen',
      Icon: CalendarCheck,
      label: 'Putzplan',
      sub: faelligeChores ? `${faelligeChores} fällig` : 'Rotation verwalten',
      color: 'bg-[#f5e6dc]',
      iconColor: 'text-[#c4694a]',
    },
    {
      href: '/einkauf',
      Icon: ShoppingCart,
      label: 'Einkaufsliste',
      sub: offenItems ? `${offenItems} Artikel offen` : 'Gemeinsam einkaufen',
      color: 'bg-[#fcecc7]',
      iconColor: 'text-[#b45309]',
    },
    {
      href: '/pinnwand',
      Icon: Megaphone,
      label: 'Pinnwand',
      sub: 'WG-Ankündigungen',
      color: 'bg-[#f5dfd9]',
      iconColor: 'text-[#a03b2d]',
    },
  ]

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-[#9a8f7c] font-medium uppercase tracking-widest mb-1">
            {wg.name}
          </p>
          <h1 className="text-2xl font-black text-[#1f1b16] tracking-[-0.03em]">
            {greeting}, {vorname}.
          </h1>
        </div>
        <Link
          href="/einstellungen"
          className="w-9 h-9 rounded-xl bg-[#ede7da] hover:bg-[#ddd4c2] flex items-center justify-center transition-colors"
        >
          <Settings className="w-4 h-4 text-[#5c5447]" />
        </Link>
      </div>

      {/* Balance Card — das wichtigste Element */}
      <div
        className={`rounded-2xl p-6 text-[#fdfbf6] relative overflow-hidden ${
          myBalance >= 0 ? 'bg-[#3d5a3d]' : 'bg-[#a03b2d]'
        }`}
      >
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#fdfbf6] opacity-[0.06] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <p className="text-[11px] uppercase tracking-widest opacity-70 mb-2">
          Dein Saldo
        </p>
        <p className="text-4xl font-black tracking-[-0.04em] mb-1">
          {myBalance >= 0 ? '+' : ''}
          {formatCurrency(myBalance)}
        </p>
        <p className="text-sm opacity-65">
          {myBalance > 0
            ? 'Deine Mitbewohner schulden dir das.'
            : myBalance < 0
              ? 'Du schuldest deinen Mitbewohnern das.'
              : 'Alles ausgeglichen. Gut gemacht.'}
        </p>
      </div>

      {/* Stats Grid — 3 Kacheln */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[#fdfbf6] border border-[#ddd4c2] rounded-2xl p-4"
          >
            <p
              className={`text-2xl font-black tracking-[-0.03em] ${s.color}`}
            >
              {s.value}
            </p>
            <p className="text-[10px] text-[#9a8f7c] mt-1 leading-tight">
              {s.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/ausgaben/neu"
          className="bg-[#3d5a3d] hover:bg-[#2f4630] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors group"
        >
          <div className="w-9 h-9 bg-[#fdfbf6]/20 rounded-xl flex items-center justify-center">
            <Plus className="w-4 h-4 text-[#fdfbf6]" />
          </div>
          <span className="text-xs font-semibold text-[#fdfbf6]">Ausgabe</span>
        </Link>
        <Link
          href="/einkauf"
          className="bg-[#fdfbf6] border border-[#ddd4c2] hover:border-[#b45309] hover:bg-[#fcecc7]/40 rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
        >
          <div className="w-9 h-9 bg-[#fcecc7] rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-4 h-4 text-[#b45309]" />
          </div>
          <span className="text-xs font-medium text-[#5c5447]">Einkauf</span>
        </Link>
        <Link
          href="/einstellungen/invite"
          className="bg-[#fdfbf6] border border-[#ddd4c2] hover:border-[#3d5a3d] hover:bg-[#e8ede3] rounded-2xl p-4 flex flex-col items-center gap-2 transition-colors"
        >
          <div className="w-9 h-9 bg-[#e8ede3] rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-[#3d5a3d]" />
          </div>
          <span className="text-xs font-medium text-[#5c5447]">Einladen</span>
        </Link>
      </div>

      {/* Members */}
      <MemberList members={membersMapped} />

      {/* Feature Shortcuts */}
      <div className="bg-[#fdfbf6] border border-[#ddd4c2] rounded-2xl divide-y divide-[#ddd4c2] overflow-hidden">
        {shortcuts.map(({ href, Icon, label, sub, color, iconColor }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 px-5 py-4 hover:bg-[#f7f3ec] transition-colors"
          >
            <div
              className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-[#1f1b16]">
                {label}
              </p>
              <p className="text-[11px] text-[#9a8f7c] mt-0.5">{sub}</p>
            </div>
            <span className="text-[#b8ac93] text-sm">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
