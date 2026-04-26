'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Member {
  user_id: string
  display_name: string
}

export default function NeueAusgabePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [paidBy, setPaidBy] = useState<string>('')
  const [splitEqual, setSplitEqual] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)
      setPaidBy(user.id)

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

      const memberList = (wgMembers ?? []).map((m) => ({
        user_id: m.user_id,
        display_name: (m.profiles as { display_name: string })?.display_name ?? 'Unbekannt',
      }))

      setMembers(memberList)
      setSelectedMembers(memberList.map((m) => m.user_id))
    }
    load()
  }, [router])

  function toggleMember(uid: string) {
    setSelectedMembers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wgId || !userId) return
    if (selectedMembers.length === 0) {
      setError('Mindestens eine Person muss die Ausgabe teilen.')
      return
    }

    const amountNum = parseFloat(amount.replace(',', '.'))
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Bitte einen gültigen Betrag eingeben.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        wg_id: wgId,
        paid_by: paidBy,
        title: title.trim(),
        amount: amountNum,
        paid_on: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (expenseError) {
      setError('Ausgabe konnte nicht gespeichert werden.')
      setLoading(false)
      return
    }

    const splitAmount = amountNum / selectedMembers.length
    const splits = selectedMembers.map((uid) => ({
      expense_id: expense.id,
      user_id: uid,
      amount: Math.round(splitAmount * 100) / 100,
      settled: uid === paidBy,
    }))

    const { error: splitsError } = await supabase
      .from('expense_splits')
      .insert(splits)

    if (splitsError) {
      setError('Fehler beim Aufteilen.')
      setLoading(false)
      return
    }

    router.push('/ausgaben')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/ausgaben" className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Neue Ausgabe</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Was wurde gekauft?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z.B. Rewe Einkauf, Toilettenpapier, Strom..."
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Betrag (€)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            required
            className="input-field text-2xl font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Wer hat bezahlt?</label>
          <div className="grid grid-cols-2 gap-2">
            {members.map((m) => (
              <button
                key={m.user_id}
                type="button"
                onClick={() => setPaidBy(m.user_id)}
                className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all ${
                  paidBy === m.user_id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {m.user_id === userId ? 'Ich' : m.display_name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wer teilt die Ausgabe?
          </label>
          <div className="space-y-2">
            {members.map((m) => {
              const selected = selectedMembers.includes(m.user_id)
              return (
                <button
                  key={m.user_id}
                  type="button"
                  onClick={() => toggleMember(m.user_id)}
                  className={`w-full rounded-xl py-3 px-4 flex items-center justify-between border-2 transition-all ${
                    selected
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-900">
                    {m.user_id === userId ? `${m.display_name} (ich)` : m.display_name}
                  </span>
                  {selected && (
                    <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {selectedMembers.length > 0 && amount && parseFloat(amount.replace(',', '.')) > 0 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Jeder zahlt: {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                parseFloat(amount.replace(',', '.')) / selectedMembers.length
              )}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !title || !amount}
          className="btn-primary w-full"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ausgabe speichern'}
        </button>
      </form>
    </div>
  )
}
