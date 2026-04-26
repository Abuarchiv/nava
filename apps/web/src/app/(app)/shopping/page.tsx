'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ShoppingCart, ChevronDown, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingList } from '@/components/shopping/ShoppingList'
import { AddItemModal } from '@/components/shopping/AddItemModal'
import { QuickAddBar } from '@/components/shopping/QuickAddBar'
import type { ShoppingItemWithProfiles } from '@nava/types'

export default function ShoppingPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [wgId, setWgId] = useState<string | null>(null)
  const [items, setItems] = useState<ShoppingItemWithProfiles[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [boughtOpen, setBoughtOpen] = useState(false)

  const pending = items.filter((i) => i.status === 'pending')
  const purchased = items.filter((i) => i.status === 'purchased')

  const loadItems = useCallback(async (wg: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('shopping_items')
      .select(`
        *,
        added_by_profile:profiles!shopping_items_added_by_fkey(*),
        bought_by_profile:profiles!shopping_items_bought_by_fkey(*)
      `)
      .eq('wg_id', wg)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    setItems((data ?? []) as ShoppingItemWithProfiles[])
  }, [])

  useEffect(() => {
    async function boot() {
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
      await loadItems(wg)
      setLoadingData(false)
    }
    boot()
  }, [router, loadItems])

  async function handleMarkBought(itemId: string) {
    if (!userId || !wgId) return
    setLoadingId(itemId)
    const supabase = createClient()
    await supabase
      .from('shopping_items')
      .update({
        status: 'purchased',
        bought_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
    await loadItems(wgId)
    setLoadingId(null)
  }

  async function handleDelete(itemId: string) {
    if (!wgId) return
    setLoadingId(itemId)
    const supabase = createClient()
    await supabase.from('shopping_items').delete().eq('id', itemId)
    await loadItems(wgId)
    setLoadingId(null)
  }

  async function handleAddItem(input: {
    name: string
    quantity?: number
    unit?: string
    category?: string
    notes?: string
  }) {
    if (!wgId || !userId) return
    setModalLoading(true)
    const supabase = createClient()
    await supabase.from('shopping_items').insert({
      wg_id: wgId,
      added_by: userId,
      status: 'pending',
      ...input,
    })
    await loadItems(wgId)
    setModalLoading(false)
  }

  async function handleQuickAdd(name: string) {
    if (!wgId || !userId) return
    const supabase = createClient()
    await supabase.from('shopping_items').insert({
      wg_id: wgId,
      added_by: userId,
      name,
      status: 'pending',
    })
    await loadItems(wgId)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Einkaufsliste</h1>
          {!loadingData && (
            <p className="text-sm text-gray-500">
              {pending.length === 0
                ? 'Alles erledigt'
                : `${pending.length} ${pending.length === 1 ? 'Artikel' : 'Artikel'} ausstehend`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary text-sm px-3 py-2"
        >
          <Plus className="w-4 h-4" />
          Hinzufügen
        </button>
      </div>

      {/* Quick Stats */}
      {!loadingData && pending.length > 0 && (
        <div className="mb-5 flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <ShoppingCart className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <p className="text-sm text-indigo-700">
            <span className="font-semibold">{pending.length}</span>{' '}
            {pending.length === 1 ? 'Artikel fehlt' : 'Artikel fehlen'} noch
          </p>
        </div>
      )}

      {/* Loading state */}
      {loadingData && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-14 animate-pulse bg-gray-100" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loadingData && pending.length === 0 && purchased.length === 0 && (
        <div className="card text-center py-10">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Einkaufsliste ist leer</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Was fehlt in der WG? Füg es hinzu.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm inline-flex"
          >
            <Plus className="w-4 h-4" />
            Artikel hinzufügen
          </button>
        </div>
      )}

      {/* Active list */}
      {!loadingData && pending.length > 0 && (
        <ShoppingList
          items={pending}
          currentUserId={userId ?? ''}
          loadingId={loadingId}
          onMarkBought={handleMarkBought}
          onDelete={handleDelete}
        />
      )}

      {/* Purchased section */}
      {!loadingData && purchased.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setBoughtOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2 w-full hover:text-gray-600 transition-colors"
          >
            {boughtOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            Bereits gekauft ({purchased.length})
          </button>

          {boughtOpen && (
            <div className="card p-0 overflow-hidden divide-y divide-gray-100 opacity-60">
              {purchased.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-5 h-5 rounded bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 line-through truncate">{item.name}</p>
                    {item.bought_by_profile && (
                      <p className="text-xs text-gray-400">
                        Gekauft von {item.bought_by_profile.display_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddItem}
        loading={modalLoading}
      />

      {/* Quick Add Bar */}
      {!loadingData && (
        <QuickAddBar
          onAdd={handleQuickAdd}
          disabled={!wgId || !userId}
        />
      )}
    </div>
  )
}
