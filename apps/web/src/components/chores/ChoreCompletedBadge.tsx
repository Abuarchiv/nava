'use client'

import { CheckCircle } from 'lucide-react'

interface ChoreCompletedBadgeProps {
  completedBy: string
  completedAt: string | Date
}

export function ChoreCompletedBadge({ completedBy, completedAt }: ChoreCompletedBadgeProps) {
  const date = new Date(completedAt)
  const formatted = date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
      <CheckCircle className="w-3 h-3 flex-shrink-0" />
      Erledigt von {completedBy} am {formatted}
    </span>
  )
}
