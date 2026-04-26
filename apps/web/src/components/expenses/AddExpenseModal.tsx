'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CATEGORY_OPTIONS, type ExpenseCategory } from './CategoryIcon'

export interface WGMember {
  userId: string
  displayName: string
}

interface AddExpenseModalProps {
  wgId: string
  currentUserId: string
  members: WGMember[]
  onClose: () => void
  onSuccess: () => void
}

type SplitMode = 'equal' | 'custom'

export function AddExpenseModal({
  wgId,
  currentUserId,
  members,
  onClose,
  onSuccess,
}: AddExpenseModalProps) {
  const today = new Date().toISOString().split('T')[0]!

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('groceries')
  const [date, setDate] = useState(today)
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitMode, setSplitMode] = useState<SplitMode>('equal')
  const [customShares, setCustomShares] = useState<Record<string, string>>(
    Object.fromEntries(members.map((m) => [m.userId, ''])),
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedAmount = parseFloat(amount.replace(',', '.'))
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0

  function equalShare(): number {
    if (!isValidAmount || members.length === 0) return 0
    return Math.round((parsedAmount / members.length) * 100) / 100
  }

  function setCustomShare(userId: string, val: string) {
    setCustomShares((prev) => ({ ...prev, [userId]: val }))
  }

  function customTotal(): number {
    return Object.values(customShares).reduce((sum, v) => {
      const n = parseFloat(v.replace(',', '.'))
      return sum + (isNaN(n) ? 0 : n)
    }, 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isValidAmount) {
      setError('Bitte einen gültigen Betrag eingeben.')
      return
    }
    if (!description.trim()) {
      setError('Bitte eine Beschreibung eingeben.')
      return
    }

    let splits: { user_id: string; share_amount: number; is_equal_split: boolean }[]

    if (splitMode === 'equal') {
      const share = equalShare()
      // Distribute rounding remainder to first person
      splits = members.map((m, i) => ({
        user_id: m.userId,
        share_amount: i === 0
          ? Math.round((parsedAmount - share * (members.length - 1)) * 100) / 100
          : share,
        is_equal_split: true,
      }))
    } else {
      const total = customTotal()
      if (Math.abs(total - parsedAmount) > 0.02) {
        setError(`Die Anteile ergeben ${total.toFixed(2)} €, nicht ${parsedAmount.toFixed(2)} €.`)
        return
      }
      splits = members.map((m) => ({
        user_id: m.userId,
        share_amount: parseFloat((customShares[m.userId] ?? '0').replace(',', '.')) || 0,
        is_equal_split: false,
      }))
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { data: expense, error: expErr } = await supabase
        .from('expenses')
        .insert({
          wg_id: wgId,
          paid_by: paidBy,
          description: description.trim(),
          amount: parsedAmount,
          paid_on: date,
        })
        .select()
        .single()

      if (expErr) throw expErr

      const { error: splitsErr } = await supabase
        .from('expense_splits')
        .insert(splits.map((s) => ({ ...s, expense_id: expense.id })))

      if (splitsErr) throw splitsErr

      onSuccess()
    } catch {
      setError('Ausgabe konnte nicht gespeichert werden. Bitte versuche es erneut.')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92dvh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">Neue Ausgabe</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Beschreibung
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z.B. Rewe Einkauf, Strom..."
              required
              className="input-field"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Betrag
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">€</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
                className="input-field pl-8 text-lg font-semibold"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Kategorie
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="input-field"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.slug} value={opt.slug}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Datum
            </label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Payer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wer hat bezahlt?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.userId}
                  type="button"
                  onClick={() => setPaidBy(m.userId)}
                  className={`rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all ${
                    paidBy === m.userId
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {m.userId === currentUserId ? 'Ich' : m.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Split mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aufteilung
            </label>
            <div className="flex gap-2 mb-3">
              {(['equal', 'custom'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSplitMode(mode)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                    splitMode === mode
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {mode === 'equal' ? 'Gleich aufteilen' : 'Benutzerdefiniert'}
                </button>
              ))}
            </div>

            {splitMode === 'equal' && isValidAmount && (
              <p className="text-xs text-gray-500 text-center">
                Jeder zahlt{' '}
                <span className="font-semibold text-gray-700">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                    equalShare(),
                  )}
                </span>
              </p>
            )}

            {splitMode === 'custom' && (
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                      {m.userId === currentUserId ? 'Ich' : m.displayName}
                    </span>
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={customShares[m.userId] ?? ''}
                        onChange={(e) => setCustomShare(m.userId, e.target.value)}
                        placeholder="0,00"
                        className="input-field pl-7 text-sm py-1.5"
                      />
                    </div>
                  </div>
                ))}
                {isValidAmount && (
                  <div
                    className={`text-xs text-right pt-1 font-medium ${
                      Math.abs(customTotal() - parsedAmount) < 0.02
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    Summe:{' '}
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
                      customTotal(),
                    )}{' '}
                    / {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(parsedAmount)}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !description.trim() || !isValidAmount}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ausgabe hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  )
}
