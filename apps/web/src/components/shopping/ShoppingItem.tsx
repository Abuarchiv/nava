'use client'

import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { Avatar } from '@nava/ui'
import { cn } from '@/lib/utils'
import type { ShoppingItemWithProfiles } from '@nava/types'

interface Props {
  item: ShoppingItemWithProfiles
  currentUserId: string
  onMarkBought: (itemId: string) => void
  onDelete: (itemId: string) => void
  isLoading?: boolean
}

export function ShoppingItem({ item, currentUserId: _currentUserId, onMarkBought, onDelete, isLoading }: Props) {
  const [checked, setChecked] = useState(item.status === 'purchased')
  const isPurchased = item.status === 'purchased'
  const addedByName = item.added_by_profile?.display_name ?? 'Unbekannt'
  const boughtByName = item.bought_by_profile?.display_name ?? null

  function handleCheck() {
    if (isPurchased || isLoading) return
    setChecked(true)
    onMarkBought(item.id)
  }

  const quantityLabel =
    item.quantity != null && item.unit
      ? `${item.quantity} × ${item.unit}`
      : item.quantity != null
        ? String(item.quantity)
        : item.unit ?? null

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 transition-colors duration-150',
        isPurchased ? 'opacity-50' : 'hover:bg-gray-50',
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleCheck}
        disabled={isPurchased || isLoading}
        aria-label={isPurchased ? 'Bereits gekauft' : 'Als gekauft markieren'}
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center',
          'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1',
          isPurchased || checked
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-gray-300 hover:border-indigo-500',
          isLoading && 'opacity-60 cursor-wait',
        )}
      >
        {(isPurchased || checked) && !isLoading && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
        {isLoading && (
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium transition-all duration-200',
            isPurchased || checked
              ? 'line-through text-gray-400'
              : 'text-gray-900',
          )}
        >
          {item.name}
          {quantityLabel && (
            <span className="ml-2 text-gray-400 font-normal">— {quantityLabel}</span>
          )}
        </p>

        <div className="flex items-center gap-1 mt-0.5">
          <Avatar name={addedByName} size="xs" />
          <span className="text-xs text-gray-400">
            {isPurchased && boughtByName
              ? `Gekauft von ${boughtByName}`
              : `${addedByName}`}
          </span>
        </div>

        {item.notes && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.notes}</p>
        )}
      </div>

      {/* Delete button */}
      {!isPurchased && (
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={isLoading}
          aria-label="Artikel löschen"
          className={cn(
            'p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50',
            'transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300',
            'opacity-0 group-hover:opacity-100',
            'sm:opacity-0 sm:group-hover:opacity-100',
            // Always visible on touch devices
            'max-sm:opacity-100',
          )}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
