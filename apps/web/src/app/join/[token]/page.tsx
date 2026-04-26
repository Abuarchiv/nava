'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, Users, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'ready' | 'joining' | 'done' | 'error'

interface WgInfo {
  name: string
  memberCount: number
}

export default function JoinPage() {
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<Status>('loading')
  const [wgInfo, setWgInfo] = useState<WgInfo | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvite() {
      const supabase = createClient()

      // Auth-Status prüfen
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)

      // Einladung laden
      const { data: invite, error: inviteError } = await supabase
        .from('invite_links')
        .select('wg_id, expires_at, max_uses, use_count, wgs(name)')
        .eq('token', token)
        .single()

      if (inviteError || !invite) {
        setError('Dieser Einladungslink ist ungültig oder existiert nicht.')
        setStatus('error')
        return
      }

      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        setError('Dieser Einladungslink ist abgelaufen.')
        setStatus('error')
        return
      }

      if (invite.max_uses !== null && invite.use_count >= invite.max_uses) {
        setError('Dieser Link wurde bereits zu oft verwendet.')
        setStatus('error')
        return
      }

      // Mitglieder-Anzahl laden
      const { count } = await supabase
        .from('wg_members')
        .select('id', { count: 'exact', head: true })
        .eq('wg_id', invite.wg_id)

      setWgInfo({
        name: (invite.wgs as { name: string }).name,
        memberCount: count ?? 0,
      })
      setStatus('ready')
    }

    loadInvite()
  }, [token])

  async function handleJoin() {
    setStatus('joining')
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Nicht eingeloggt → erst registrieren/einloggen, dann zurück
      router.push(`/register?redirect=/join/${token}`)
      return
    }

    const { data: invite, error: inviteError } = await supabase
      .from('invite_links')
      .select('wg_id, use_count')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      setError('Einladungslink nicht mehr gültig.')
      setStatus('error')
      return
    }

    // Bereits Mitglied?
    const { data: existing } = await supabase
      .from('wg_members')
      .select('id')
      .eq('wg_id', invite.wg_id)
      .eq('user_id', user.id)
      .single()

    if (existing) {
      router.push('/dashboard')
      return
    }

    const { error: joinError } = await supabase
      .from('wg_members')
      .insert({ wg_id: invite.wg_id, user_id: user.id, role: 'member' })

    if (joinError) {
      setError('Beitreten fehlgeschlagen. Versuch es nochmal.')
      setStatus('error')
      return
    }

    // Nutzungscount hochzählen
    await supabase
      .from('invite_links')
      .update({ use_count: invite.use_count + 1 })
      .eq('token', token)

    setStatus('done')
    setTimeout(() => router.push('/dashboard'), 1800)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="font-bold text-xl text-gray-900">nava</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          {/* Laden */}
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Einladung wird überprüft...</p>
            </div>
          )}

          {/* Bereit */}
          {status === 'ready' && wgInfo && (
            <>
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold',
                    getAvatarColor(wgInfo.name),
                  )}
                >
                  {getInitials(wgInfo.name)}
                </div>
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Du wurdest eingeladen!
              </h1>
              <p className="text-sm text-gray-500 mb-1">
                Tritt der WG{' '}
                <span className="font-semibold text-gray-900">{wgInfo.name}</span> bei.
              </p>
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-6">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {wgInfo.memberCount}{' '}
                  {wgInfo.memberCount === 1 ? 'Mitglied' : 'Mitglieder'} bereits dabei
                </span>
              </div>

              <button onClick={handleJoin} className="btn-primary w-full">
                WG beitreten
                <ArrowRight className="w-4 h-4" />
              </button>

              {!isLoggedIn && (
                <p className="text-xs text-gray-400 mt-3">
                  Noch kein Account?{' '}
                  <Link
                    href={`/register?redirect=/join/${token}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Jetzt registrieren
                  </Link>
                </p>
              )}
            </>
          )}

          {/* Beitreten läuft */}
          {status === 'joining' && (
            <div className="py-8">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Trete WG bei...</p>
            </div>
          )}

          {/* Erfolgreich beigetreten */}
          {status === 'done' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-900 text-lg">
                Willkommen in der WG!
              </p>
              <p className="text-sm text-gray-500 mt-1">Du wirst weitergeleitet...</p>
            </div>
          )}

          {/* Fehler */}
          {status === 'error' && (
            <div className="py-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="font-semibold text-gray-900 mb-2">Link ungültig</p>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <div className="flex flex-col gap-2">
                <Link href="/onboarding" className="btn-primary text-sm inline-flex justify-center">
                  Neue WG erstellen
                </Link>
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Zur Startseite
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
