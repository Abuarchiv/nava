'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NeuesEinkaufItem() {
  const router = useRouter()
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [items, setItems] = useState([{ name: '', quantity: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id')
        .eq('user_id', user.id)
        .limit(1)

      const wg = memberships?.[0]?.wg_id
      if (!wg) { router.push('/onboarding'); return }
      setWgId(wg)
    }
    load()
  }, [router])

  function addRow() {
    setItems((prev) => [...prev, { name: '', quantity: '' }])
  }

  function updateItem(index: number, field: 'name' | 'quantity', value: string) {
    setItems((prev) => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function removeRow(index: number) {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!wgId || !userId) return

    const validItems = items.filter((i) => i.name.trim())
    if (validItems.length === 0) {
      setError('Mindestens einen Eintrag hinzufügen.')
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: insertError } = await supabase
      .from('shopping_items')
      .insert(validItems.map((i) => ({
        wg_id: wgId,
        name: i.name.trim(),
        quantity: i.quantity.trim() || null,
        added_by: userId,
        status: 'pending' as const,
      })))

    if (insertError) {
      setError('Fehler beim Speichern.')
      setLoading(false)
      return
    }

    router.push('/einkauf')
    router.refresh()
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/einkauf" className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Was brauchen wir?</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="card space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                placeholder={index === 0 ? 'z.B. Milch, Butter, Nudeln...' : 'Noch etwas...'}
                className="input-field flex-1"
                autoFocus={index === 0}
              />
              <input
                type="text"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                placeholder="Menge"
                className="input-field w-20"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="text-gray-300 hover:text-red-400 transition-colors px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 border border-dashed border-indigo-200 rounded-lg hover:border-indigo-300 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Weiteres hinzufügen
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            `${items.filter((i) => i.name.trim()).length || 1} ${items.filter((i) => i.name.trim()).length === 1 ? 'Eintrag' : 'Einträge'} speichern`
          )}
        </button>
      </form>
    </div>
  )
}
