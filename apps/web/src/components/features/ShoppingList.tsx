'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ShoppingItem {
  id: string
  name: string
  quantity: string | null
  status: 'pending' | 'purchased' | 'archived'
  added_by: string
  profiles: { display_name: string } | null
}

interface Props {
  items: ShoppingItem[]
  doneItems: ShoppingItem[]
  userId: string
  wgId: string
}

export function ShoppingList({ items, doneItems, userId, wgId }: Props) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function markPurchased(id: string) {
    setLoadingId(id)
    const supabase = createClient()
    await supabase
      .from('shopping_items')
      .update({
        status: 'purchased',
        purchased_by: userId,
        purchased_at: new Date().toISOString(),
      })
      .eq('id', id)
    setLoadingId(null)
    router.refresh()
  }

  async function deleteItem(id: string) {
    setLoadingId(id)
    const supabase = createClient()
    await supabase.from('shopping_items').delete().eq('id', id)
    setLoadingId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Pending */}
      <div className="card divide-y divide-gray-100 p-0 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <button
              onClick={() => markPurchased(item.id)}
              disabled={loadingId === item.id}
              className="w-5 h-5 rounded border-2 border-gray-300 hover:border-indigo-500 flex-shrink-0 flex items-center justify-center transition-colors"
            >
              {loadingId === item.id && (
                <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              {item.quantity && (
                <p className="text-xs text-gray-400">{item.quantity}</p>
              )}
            </div>
            <button
              onClick={() => deleteItem(item.id)}
              disabled={loadingId === item.id}
              className="p-1 text-gray-300 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Done items */}
      {doneItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Zuletzt gekauft</p>
          <div className="card divide-y divide-gray-100 p-0 overflow-hidden opacity-60">
            {doneItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-5 h-5 rounded bg-emerald-500 flex-shrink-0 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <p className="text-sm text-gray-500 line-through">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
