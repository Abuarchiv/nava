'use client'

import { ExpenseItem, type ExpenseItemData } from './ExpenseItem'

interface ExpenseListProps {
  expenses: ExpenseItemData[]
  onExpenseClick?: (id: string) => void
}

function getGroupLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()

  const toMidnight = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const todayMs = toMidnight(now).getTime()
  const dateMs = toMidnight(date).getTime()
  const diffDays = Math.round((todayMs - dateMs) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return 'Diese Woche'

  const thisWeekStart = toMidnight(now)
  thisWeekStart.setDate(now.getDate() - now.getDay())
  const lastWeekStart = new Date(thisWeekStart)
  lastWeekStart.setDate(thisWeekStart.getDate() - 7)

  if (dateMs >= lastWeekStart.getTime() && dateMs < thisWeekStart.getTime()) {
    return 'Letzte Woche'
  }

  // Same month?
  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return 'Diesen Monat'
  }

  return new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(date)
}

export function ExpenseList({ expenses, onExpenseClick }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-3xl mb-3">💸</p>
        <p className="font-medium text-gray-700">Keine Ausgaben gefunden</p>
        <p className="text-sm text-gray-400 mt-1">Passe den Filter an oder füge eine neue Ausgabe hinzu.</p>
      </div>
    )
  }

  // Group by date label — maintain insertion order (expenses already sorted newest first)
  const groups: { label: string; items: ExpenseItemData[] }[] = []
  const labelIndex = new Map<string, number>()

  for (const expense of expenses) {
    const label = getGroupLabel(expense.paid_on)
    if (!labelIndex.has(label)) {
      labelIndex.set(label, groups.length)
      groups.push({ label, items: [] })
    }
    groups[labelIndex.get(label)!]!.items.push(expense)
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
            {group.label}
          </h3>
          <div className="space-y-2">
            {group.items.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onClick={onExpenseClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
