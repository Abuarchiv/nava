'use client'

import { CategoryIcon } from './CategoryIcon'
import { formatCurrency } from '@/lib/utils'

export interface ExpenseItemData {
  id: string
  description: string
  amount: number
  paid_on: string
  category_slug?: string | null
  payer_name: string
  payer_is_me: boolean
  my_share: number
}

interface ExpenseItemProps {
  expense: ExpenseItemData
  onClick?: (id: string) => void
}

export function ExpenseItem({ expense, onClick }: ExpenseItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(expense.id)}
      className="w-full card flex items-center gap-3 text-left hover:border-indigo-200 transition-colors cursor-pointer"
    >
      {/* Category Icon */}
      <CategoryIcon category={expense.category_slug} size="md" />

      {/* Description + Payer */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
        <p className="text-xs text-gray-500">
          {expense.payer_is_me ? 'Du' : expense.payer_name}
        </p>
      </div>

      {/* Amount + Share */}
      <div className="text-right flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
        <p className={`text-xs font-medium ${expense.payer_is_me ? 'text-emerald-600' : 'text-red-600'}`}>
          {expense.payer_is_me
            ? `+${formatCurrency(expense.amount - expense.my_share)}`
            : `-${formatCurrency(expense.my_share)}`}
        </p>
      </div>
    </button>
  )
}
