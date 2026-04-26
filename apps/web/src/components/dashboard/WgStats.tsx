'use client'

import { Euro, CalendarCheck, ShoppingCart, Clock } from 'lucide-react'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'

interface WgStatsProps {
  gesamtSchulden: number
  faelligeChores: number
  pendingItems: number
  letzteAktivitaet: string | null
}

export function WgStats({
  gesamtSchulden,
  faelligeChores,
  pendingItems,
  letzteAktivitaet,
}: WgStatsProps) {
  const stats = [
    {
      label: 'Offene Schulden',
      value: formatCurrency(gesamtSchulden),
      icon: Euro,
      color: gesamtSchulden > 0 ? 'text-red-600' : 'text-emerald-600',
      bg: gesamtSchulden > 0 ? 'bg-red-50' : 'bg-emerald-50',
      iconBg: gesamtSchulden > 0 ? 'bg-red-100' : 'bg-emerald-100',
    },
    {
      label: 'Chores fällig',
      value: faelligeChores.toString(),
      icon: CalendarCheck,
      color: faelligeChores > 0 ? 'text-amber-600' : 'text-emerald-600',
      bg: faelligeChores > 0 ? 'bg-amber-50' : 'bg-emerald-50',
      iconBg: faelligeChores > 0 ? 'bg-amber-100' : 'bg-emerald-100',
    },
    {
      label: 'Shopping offen',
      value: pendingItems.toString(),
      icon: ShoppingCart,
      color: pendingItems > 0 ? 'text-indigo-600' : 'text-gray-500',
      bg: pendingItems > 0 ? 'bg-indigo-50' : 'bg-gray-50',
      iconBg: pendingItems > 0 ? 'bg-indigo-100' : 'bg-gray-100',
    },
    {
      label: 'Letzte Aktivität',
      value: letzteAktivitaet ? formatRelativeDate(letzteAktivitaet) : 'Noch nichts',
      icon: Clock,
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      iconBg: 'bg-gray-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className={`rounded-xl p-4 ${stat.bg} border border-transparent`}
          >
            <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        )
      })}
    </div>
  )
}
