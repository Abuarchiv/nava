'use client'

import { useState } from 'react'
import { Copy, Check, Users, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateInviteUrl } from '@/lib/utils'

interface Props {
  wgId: string
  existingToken: string | null
  userId: string
}

export function InviteSection({ wgId, existingToken, userId }: Props) {
  const [token, setToken] = useState<string | null>(existingToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateLink() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('invite_links')
      .insert({ wg_id: wgId, created_by: userId })
      .select('token')
      .single()

    if (!error && data) {
      setToken(data.token)
    }
    setLoading(false)
  }

  async function copyLink() {
    if (!token) return
    const url = generateInviteUrl(token)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900">Mitbewohner einladen</h2>
      </div>

      {token ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 font-mono truncate border border-gray-200">
              {generateInviteUrl(token)}
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
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
            Schick den Link an neue Mitbewohner. Kein Account nötig um beizutreten.
          </p>
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={loading}
          className="btn-primary text-sm w-full"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Users className="w-4 h-4" />
              Einladungslink generieren
            </>
          )}
        </button>
      )}
    </div>
  )
}
