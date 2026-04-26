'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Member { user_id: string; display_name: string }

export default function NeueAufgabePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [assignedTo, setAssignedTo] = useState<string>('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      setAssignedTo(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id')
        .eq('user_id', user.id)
        .limit(1)

      const wg = memberships?.[0]?.wg_id
      if (!wg) { router.push('/onboarding'); return }
      setWgId(wg)

      const { data: wgMembers } = await supabase
        .from('wg_members')
        .select('user_id, profiles(display_name)')
        .eq('wg_id', wg)

      setMembers((wgMembers ?? []).map((m) => ({
        user_id: m.user_id,
        display_name: (m.profiles as { display_name: string })?.display_name ?? 'Unbekannt',
      })))
    }
    load()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wgId) return
    setLoading(true)
    setError(null)

    const nextDue = new Date()
    const freqDays: Record<string, number> = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 }
    nextDue.setDate(nextDue.getDate() + freqDays[frequency])

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('chores')
      .insert({
        wg_id: wgId,
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        assigned_to: assignedTo || null,
        next_due: nextDue.toISOString().split('T')[0],
      })

    if (insertError) {
      setError('Aufgabe konnte nicht gespeichert werden.')
      setLoading(false)
      return
    }

    router.push('/putzen')
    router.refresh()
  }

  const frequencies = [
    { value: 'daily', label: 'Täglich' },
    { value: 'weekly', label: 'Wöchentlich' },
    { value: 'biweekly', label: 'Zweiwöchentlich' },
    { value: 'monthly', label: 'Monatlich' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/putzen" className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Neue Aufgabe</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Aufgabe</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Bad putzen, Müll rausbringen..."
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Beschreibung (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details, Checkliste, Hinweise..."
            rows={2}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wie oft?</label>
          <div className="grid grid-cols-2 gap-2">
            {frequencies.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value as typeof frequency)}
                className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all ${
                  frequency === f.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wer ist zuständig?</label>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <button
                key={m.user_id}
                type="button"
                onClick={() => setAssignedTo(m.user_id)}
                className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all text-left ${
                  assignedTo === m.user_id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {m.user_id === userId ? `${m.display_name} (ich)` : m.display_name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAssignedTo('')}
              className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all text-left ${
                assignedTo === ''
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              Niemand (Rotation)
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading || !title} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aufgabe erstellen'}
        </button>
      </form>
    </div>
  )
}
