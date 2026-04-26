'use client'

export type Frequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'

interface FrequencyBadgeProps {
  frequency: Frequency | string
}

const LABELS: Record<string, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  biweekly: 'Zweiwöchentlich',
  monthly: 'Monatlich',
}

const COLORS: Record<string, string> = {
  daily: 'bg-violet-100 text-violet-700',
  weekly: 'bg-blue-100 text-blue-700',
  biweekly: 'bg-sky-100 text-sky-700',
  monthly: 'bg-teal-100 text-teal-700',
}

export function FrequencyBadge({ frequency }: FrequencyBadgeProps) {
  const label = LABELS[frequency] ?? frequency
  const color = COLORS[frequency] ?? 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}
