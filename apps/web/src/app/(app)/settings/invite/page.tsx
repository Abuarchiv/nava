'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, RefreshCw, Loader2, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { generateInviteUrl } from '@/lib/utils'

export default function InvitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

      setUserId(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id')
        .eq('user_id', user.id)
        .limit(1)

      const wgIdLoaded = memberships?.[0]?.wg_id
      if (!wgIdLoaded) {
        router.push('/onboarding')
        return
      }

      setWgId(wgIdLoaded)

      // Bestehenden, nicht abgelaufenen Link laden
      const { data: existing } = await supabase
        .from('invite_links')
        .select('token, expires_at')
        .eq('wg_id', wgIdLoaded)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        const notExpired =
          !existing.expires_at || new Date(existing.expires_at) > new Date()
        if (notExpired) {
          setToken(existing.token)
          setExpiresAt(existing.expires_at)
        }
      }

      setLoading(false)
    }

    load()
  }, [router])

  // QR-Code via Canvas rendern wenn Token gesetzt
  useEffect(() => {
    if (!token || !canvasRef.current) return
    renderQrCode(generateInviteUrl(token), canvasRef.current)
  }, [token])

  async function generateLink() {
    if (!wgId || !userId) return
    setGenerating(true)

    const supabase = createClient()

    // 7-Tage Ablauf
    const expires = new Date()
    expires.setDate(expires.getDate() + 7)

    const { data, error } = await supabase
      .from('invite_links')
      .insert({
        wg_id: wgId,
        created_by: userId,
        expires_at: expires.toISOString(),
      })
      .select('token, expires_at')
      .single()

    if (!error && data) {
      setToken(data.token)
      setExpiresAt(data.expires_at)
    }

    setGenerating(false)
  }

  async function copyLink() {
    if (!token) return
    await navigator.clipboard.writeText(generateInviteUrl(token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const inviteUrl = token ? generateInviteUrl(token) : null

  const ablaufText = expiresAt
    ? `Gültig bis ${new Date(expiresAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })}`
    : 'Kein Ablaufdatum'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/einstellungen"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Mitbewohner einladen</h1>
      </div>

      {token ? (
        <>
          {/* QR-Code */}
          <div className="card flex flex-col items-center py-6 gap-4">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="rounded-xl border border-gray-100"
            />
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{ablaufText}</span>
            </div>
          </div>

          {/* Link */}
          <div className="card space-y-3">
            <p className="text-sm font-medium text-gray-700">Einladungslink</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2.5 text-xs text-gray-600 font-mono truncate border border-gray-200 flex items-center">
                {inviteUrl}
              </div>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  copied
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Kopieren
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Schick den Link oder QR-Code an neue Mitbewohner. Der Link ist 7 Tage gültig.
            </p>
          </div>

          {/* Neuen Link generieren */}
          <button
            onClick={generateLink}
            disabled={generating}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Neuen Link generieren
          </button>
        </>
      ) : (
        /* Noch kein Link */
        <div className="card text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Noch kein Einladungslink</p>
            <p className="text-sm text-gray-500 mt-1">
              Generiere einen Link und teile ihn mit deinen Mitbewohnern.
              Er ist 7 Tage gültig.
            </p>
          </div>
          <button
            onClick={generateLink}
            disabled={generating}
            className="btn-primary mx-auto inline-flex"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Einladungslink generieren'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

// Minimaler QR-Code Generator via Canvas (ohne externe Library)
// Nutzt die QR-Code-API von Google Charts als Fallback
function renderQrCode(url: string, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = canvas.width
  const img = new Image()
  img.crossOrigin = 'anonymous'
  // Google Charts QR API (kostenlos, kein Key nötig)
  img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(url)}&choe=UTF-8`
  img.onload = () => {
    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0, size, size)
  }
  img.onerror = () => {
    // Fallback: Text rendern
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = '#6366f1'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('QR-Code', size / 2, size / 2 - 8)
    ctx.fillText('nicht verfügbar', size / 2, size / 2 + 8)
  }
}
