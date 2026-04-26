'use client'

import { ShoppingItem } from './ShoppingItem'
import type { ShoppingItemWithProfiles } from '@nava/types'

const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: 'Lebensmittel', label: 'Lebensmittel', emoji: '🥦' },
  { key: 'Haushalt', label: 'Haushalt', emoji: '🧹' },
  { key: 'Hygiene', label: 'Hygiene', emoji: '🧴' },
  { key: 'Sonstiges', label: 'Sonstiges', emoji: '📦' },
]

const CATEGORY_KEYS = CATEGORIES.map((c) => c.key)

function groupByCategory(items: ShoppingItemWithProfiles[]) {
  const groups: Record<string, ShoppingItemWithProfiles[]> = {}

  for (const item of items) {
    const cat = item.category && CATEGORY_KEYS.includes(item.category) ? item.category : 'Sonstiges'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(item)
  }

  return groups
}

interface Props {
  items: ShoppingItemWithProfiles[]
  currentUserId: string
  loadingId: string | null
  onMarkBought: (itemId: string) => void
  onDelete: (itemId: string) => void
}

export function ShoppingList({ items, currentUserId, loadingId, onMarkBought, onDelete }: Props) {
  const groups = groupByCategory(items)

  const orderedKeys = CATEGORY_KEYS.filter((k) => groups[k]?.length)

  if (orderedKeys.length === 0) return null

  return (
    <div className="space-y-4">
      {orderedKeys.map((catKey) => {
        const cat = CATEGORIES.find((c) => c.key === catKey)!
        const catItems = groups[catKey]

        return (
          <div key={catKey}>
            {/* Category header */}
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-base" aria-hidden="true">{cat.emoji}</span>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {cat.label}
              </h3>
              <span className="text-xs text-gray-400">({catItems.length})</span>
            </div>

            {/* Items */}
            <div className="card p-0 overflow-hidden divide-y divide-gray-100">
              {catItems.map((item) => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  currentUserId={currentUserId}
                  onMarkBought={onMarkBought}
                  onDelete={onDelete}
                  isLoading={loadingId === item.id}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
