'use client'

import { useState, useRef, useEffect } from 'react'
import { Modal, Button, Input } from '@nava/ui'
import type { AddShoppingItemInput } from '@nava/types'

const COMMON_ITEMS = [
  'Milch', 'Brot', 'Butter', 'Eier', 'Käse', 'Joghurt',
  'Nudeln', 'Reis', 'Mehl', 'Zucker', 'Salz', 'Öl',
  'Tomaten', 'Kartoffeln', 'Zwiebeln', 'Knoblauch', 'Äpfel', 'Bananen',
  'Hähnchen', 'Hackfleisch', 'Wurst', 'Schinken',
  'Spülmittel', 'Toilettenpapier', 'Müllbeutel', 'Waschmittel',
  'Shampoo', 'Duschgel', 'Zahnpasta',
]

const CATEGORIES = [
  { value: 'Lebensmittel', label: 'Lebensmittel' },
  { value: 'Haushalt', label: 'Haushalt' },
  { value: 'Hygiene', label: 'Hygiene' },
  { value: 'Sonstiges', label: 'Sonstiges' },
]

const UNITS = ['Stück', 'Liter', 'kg', 'g', 'Packung', 'Flasche', 'Dose', 'Bund']

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (input: Omit<AddShoppingItemInput, 'wg_id' | 'added_by'>) => Promise<void>
  loading?: boolean
}

interface FormState {
  name: string
  quantity: string
  unit: string
  category: string
  notes: string
}

const EMPTY: FormState = { name: '', quantity: '', unit: '', category: '', notes: '' }

export function AddItemModal({ open, onClose, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setForm(EMPTY)
      setError(null)
      setSuggestions([])
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [open])

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleNameChange(value: string) {
    set('name', value)
    if (value.length >= 1) {
      const matches = COMMON_ITEMS.filter((item) =>
        item.toLowerCase().startsWith(value.toLowerCase()),
      )
      setSuggestions(matches.slice(0, 6))
      setShowSuggestions(matches.length > 0)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  function applySuggestion(name: string) {
    set('name', name)
    setShowSuggestions(false)
    // Auto-assign category
    const lebensmittel = ['Milch', 'Brot', 'Butter', 'Eier', 'Käse', 'Joghurt', 'Nudeln', 'Reis', 'Mehl', 'Zucker', 'Salz', 'Öl', 'Tomaten', 'Kartoffeln', 'Zwiebeln', 'Knoblauch', 'Äpfel', 'Bananen', 'Hähnchen', 'Hackfleisch', 'Wurst', 'Schinken']
    const haushalt = ['Spülmittel', 'Müllbeutel', 'Waschmittel']
    const hygiene = ['Toilettenpapier', 'Shampoo', 'Duschgel', 'Zahnpasta']
    if (lebensmittel.includes(name)) set('category', 'Lebensmittel')
    else if (haushalt.includes(name)) set('category', 'Haushalt')
    else if (hygiene.includes(name)) set('category', 'Hygiene')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Bitte einen Namen eingeben.')
      return
    }
    setError(null)
    await onSubmit({
      name: form.name.trim(),
      quantity: form.quantity ? Number(form.quantity) : undefined,
      unit: form.unit || undefined,
      category: form.category || undefined,
      notes: form.notes.trim() || undefined,
    })
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Artikel hinzufügen" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + Autocomplete */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Artikel <span className="text-red-500">*</span>
          </label>
          <input
            ref={nameRef}
            type="text"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onFocus={() => form.name.length >= 1 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="z.B. Milch, Brot, Butter..."
            autoComplete="off"
            className="input-field"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onMouseDown={() => applySuggestion(s)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        {/* Menge + Einheit */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Menge"
              type="number"
              min="0"
              step="any"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              placeholder="z.B. 2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
            <select
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              className="input-field"
            >
              <option value="">—</option>
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Kategorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => set('category', form.category === cat.value ? '' : cat.value)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors duration-150',
                  form.category === cat.value
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300 hover:text-indigo-600',
                ].join(' ')}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notizen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notiz</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Optional..."
            rows={2}
            className="input-field resize-none"
          />
        </div>

        {/* Submit */}
        <Button type="submit" loading={loading} fullWidth>
          Zur Liste hinzufügen
        </Button>
      </form>
    </Modal>
  )
}
