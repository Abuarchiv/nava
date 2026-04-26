import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getInitials, getAvatarColor, generateInviteUrl } from '@/lib/utils'
import Link from 'next/link'
import { LogOut, User, Users, Copy, ExternalLink, Github, ChevronRight } from 'lucide-react'
import { InviteSection } from '@/components/features/InviteSection'
import { LogoutButton } from '@/components/features/LogoutButton'

export default async function EinstellungenPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await supabase
    .from('wg_members')
    .select('wg_id, role, wgs(name, address)')
    .eq('user_id', user.id)
    .limit(1)

  const membership = memberships?.[0]
  const wg = membership?.wgs as { name: string; address: string | null } | undefined

  // Get existing invite link or null
  let inviteToken: string | null = null
  if (membership?.wg_id) {
    const { data: invite } = await supabase
      .from('invite_links')
      .select('token')
      .eq('wg_id', membership.wg_id)
      .is('expires_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    inviteToken = invite?.token ?? null
  }

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'Du'

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">Einstellungen</h1>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${getAvatarColor(displayName)} flex items-center justify-center text-white font-semibold text-lg`}>
            {getInitials(displayName)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <Link
          href="/einstellungen/profil"
          className="flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-2 border-t border-gray-100"
        >
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Profil bearbeiten
          </span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
      </div>

      {/* WG Info */}
      {wg && membership && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">{wg.name}</h2>
            {membership.role === 'admin' && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full">Admin</span>
            )}
          </div>
          {wg.address && (
            <p className="text-sm text-gray-500 mb-3">{wg.address}</p>
          )}
        </div>
      )}

      {/* Invite */}
      {membership?.wg_id && (
        <InviteSection
          wgId={membership.wg_id}
          existingToken={inviteToken}
          userId={user.id}
        />
      )}

      {/* Links */}
      <div className="card space-y-1 p-2">
        <Link
          href="/datenschutz"
          className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Datenschutzerklärung
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <Link
          href="/impressum"
          className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Impressum
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>
        <a
          href="https://github.com/Abuarchiv/nava"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <Github className="w-4 h-4 text-gray-400" />
            Open Source auf GitHub
          </span>
          <ExternalLink className="w-3 h-3 text-gray-400" />
        </a>
      </div>

      {/* Logout */}
      <LogoutButton />
    </div>
  )
}
