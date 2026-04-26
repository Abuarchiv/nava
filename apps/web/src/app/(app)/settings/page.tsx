'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Users,
  Link2,
  LogOut,
  Trash2,
  Crown,
  Loader2,
  Check,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Member {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  role: 'admin' | 'member'
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [wgId, setWgId] = useState<string | null>(null)
  const [wgName, setWgName] = useState('')
  const [wgNameInput, setWgNameInput] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [myRole, setMyRole] = useState<'admin' | 'member'>('member')
  const [savingName, setSavingName] = useState(false)
  const [savedName, setSavedName] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [leavingWg, setLeavingWg] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setMyUserId(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id, role, wgs(id, name)')
        .eq('user_id', user.id)
        .limit(1)

      const m = memberships?.[0]
      if (!m) {
        router.push('/onboarding')
        return
      }

      const wg = m.wgs as { id: string; name: string }
      setWgId(wg.id)
      setWgName(wg.name)
      setWgNameInput(wg.name)
      setMyRole(m.role as 'admin' | 'member')

      const { data: wgMembers } = await supabase
        .from('wg_members')
        .select('id, user_id, role, profiles(display_name, avatar_url)')
        .eq('wg_id', wg.id)

      const mapped: Member[] = (wgMembers ?? []).map((wm) => {
        const p = wm.profiles as { display_name: string; avatar_url: string | null } | null
        return {
          id: wm.id,
          userId: wm.user_id,
          displayName: p?.display_name ?? 'Unbekannt',
          avatarUrl: p?.avatar_url ?? null,
          role: wm.role as 'admin' | 'member',
        }
      })

      setMembers(mapped)
      setLoading(false)
    }

    load()
  }, [router])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!wgId || !wgNameInput.trim()) return
    setSavingName(true)
    setError(null)

    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('wgs')
      .update({ name: wgNameInput.trim() })
      .eq('id', wgId)

    if (updateError) {
      setError('WG-Name konnte nicht gespeichert werden.')
    } else {
      setWgName(wgNameInput.trim())
      setSavedName(true)
      setTimeout(() => setSavedName(false), 2000)
    }
    setSavingName(false)
  }

  async function handleRemoveMember(memberId: string, userId: string) {
    if (!wgId) return
    if (!confirm('Mitglied wirklich entfernen?')) return
    setRemovingId(memberId)

    const supabase = createClient()
    const { error: removeError } = await supabase
      .from('wg_members')
      .delete()
      .eq('id', memberId)

    if (removeError) {
      setError('Mitglied konnte nicht entfernt werden.')
    } else {
      setMembers((prev) => prev.filter((m) => m.id !== memberId))
    }
    setRemovingId(null)
  }

  async function handleLeaveWg() {
    if (!wgId || !myUserId) return
    if (!confirm('WG wirklich verlassen? Diese Aktion kann nicht rückgängig gemacht werden.')) return
    setLeavingWg(true)

    const supabase = createClient()
    const { error: leaveError } = await supabase
      .from('wg_members')
      .delete()
      .eq('wg_id', wgId)
      .eq('user_id', myUserId)

    if (leaveError) {
      setError('WG verlassen fehlgeschlagen.')
      setLeavingWg(false)
    } else {
      router.push('/onboarding')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-gray-900">WG-Einstellungen</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* WG-Name */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-400" />
          <h2 className="font-semibold text-gray-900">WG-Name</h2>
        </div>
        <form onSubmit={handleSaveName} className="flex gap-2">
          <input
            type="text"
            value={wgNameInput}
            onChange={(e) => setWgNameInput(e.target.value)}
            maxLength={100}
            required
            disabled={myRole !== 'admin'}
            className="input-field flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="z.B. WG Südstadt"
          />
          {myRole === 'admin' && (
            <button
              type="submit"
              disabled={savingName || wgNameInput.trim() === wgName}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                savedName
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40',
              )}
            >
              {savingName ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : savedName ? (
                <Check className="w-4 h-4" />
              ) : (
                'Speichern'
              )}
            </button>
          )}
        </form>
        {myRole !== 'admin' && (
          <p className="text-xs text-gray-400 mt-2">Nur Admins können den Namen ändern.</p>
        )}
      </div>

      {/* Mitglieder */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Mitglieder</h2>
          </div>
          <span className="text-xs text-gray-400">{members.length} Personen</span>
        </div>

        <div className="space-y-2">
          {members.map((member) => {
            const isMe = member.userId === myUserId
            const initials = getInitials(member.displayName)
            const avatarColor = getAvatarColor(member.displayName)

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 py-1.5"
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.displayName}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                      avatarColor,
                    )}
                  >
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.displayName}
                    </p>
                    {isMe && (
                      <span className="text-xs text-gray-400">(du)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {member.role === 'admin' && (
                      <Crown className="w-3 h-3 text-amber-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {member.role === 'admin' ? 'Admin' : 'Mitglied'}
                    </span>
                  </div>
                </div>

                {/* Admin kann andere entfernen, nicht sich selbst */}
                {myRole === 'admin' && !isMe && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.userId)}
                    disabled={removingId === member.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Mitglied entfernen"
                  >
                    {removingId === member.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Einladen */}
      <Link
        href="/einstellungen/invite"
        className="card flex items-center gap-3 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
      >
        <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Link2 className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Mitbewohner einladen</p>
          <p className="text-xs text-gray-500">Invite-Link generieren & teilen</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </Link>

      {/* WG verlassen */}
      <div className="card border-red-100">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-gray-400" />
          WG verlassen
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Du verlässt die WG{' '}
          <span className="font-medium text-gray-700">{wgName}</span>. Deine Daten bleiben
          erhalten, aber du wirst aus der Gruppe entfernt.
        </p>
        <button
          onClick={handleLeaveWg}
          disabled={leavingWg}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {leavingWg ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          WG verlassen
        </button>
      </div>
    </div>
  )
}
