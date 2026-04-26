'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface WgMember {
  user_id: string
  display_name: string
}

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

interface AddChoreModalProps {
  open: boolean
  onClose: () => void
  members: WgMember[]
  currentUserId: string
  onSubmit: (data: {
    title: string
    description: string | null
    frequency: Frequency
    assigned_to: string | null
    start_date: string
  }) => Promise<void>
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Täglich' },
  { value: 'weekly', label: 'Wöchentlich' },
  { value: 'biweekly', label: 'Zweiwöchentlich' },
  { value: 'monthly', label: 'Monatlich' },
]

function todayIso(): string {
  return new Date().toISOString().split('T')[0]
}

export function AddChoreModal({ open, onClose, members, currentUserId, onSubmit }: AddChoreModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('weekly')
  const [assignedTo, setAssignedTo] = useState<string>(currentUserId)
  const [startDate, setStartDate] = useState(todayIso())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  function reset() {
    setTitle('')
    setDescription('')
    setFrequency('weekly')
    setAssignedTo(currentUserId)
    setStartDate(todayIso())
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        frequency,
        assigned_to: assignedTo || null,
        start_date: startDate,
      })
      reset()
      onClose()
    } catch {
      setError('Aufgabe konnte nicht gespeichert werden. Bitte nochmal versuchen.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-chore-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 id="add-chore-title" className="text-lg font-semibold text-gray-900">
            Aufgabe hinzufügen
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Schließen"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="chore-title">
              Aufgabe <span className="text-red-500">*</span>
            </label>
            <input
              id="chore-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z.B. Bad putzen, Müll rausbringen…"
              required
              autoFocus
              className="input-field w-full"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="chore-desc">
              Beschreibung <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="chore-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details, Checkliste, Hinweise…"
              rows={2}
              className="input-field w-full resize-none"
            />
          </div>

          {/* Frequenz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wie oft?</label>
            <div className="grid grid-cols-2 gap-2">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    'rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all',
                    frequency === f.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Zugewiesen an */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.user_id}
                  type="button"
                  onClick={() => setAssignedTo(m.user_id)}
                  className={cn(
                    'rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all text-left truncate',
                    assignedTo === m.user_id
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300',
                  )}
                >
                  {m.user_id === currentUserId ? `${m.display_name} (ich)` : m.display_name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAssignedTo('')}
                className={cn(
                  'rounded-xl py-2.5 px-3 text-sm font-medium border-2 transition-all text-left',
                  assignedTo === ''
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300',
                )}
              >
                Rotation
              </button>
            </div>
          </div>

          {/* Startdatum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="chore-start">
              Startdatum
            </label>
            <input
              id="chore-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="btn-primary w-full"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aufgabe hinzufügen'}
          </button>
        </form>
      </div>
    </div>
  )
}
