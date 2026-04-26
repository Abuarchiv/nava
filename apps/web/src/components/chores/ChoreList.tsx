'use client'

import { ChoreItem, type ChoreItemData } from './ChoreItem'
import { CalendarCheck } from 'lucide-react'

interface ChoreListProps {
  chores: ChoreItemData[]
  currentUserId: string
  onComplete: (choreId: string) => Promise<void>
}

type Group = 'overdue' | 'today' | 'this_week' | 'later'

interface GroupedChores {
  overdue: ChoreItemData[]
  today: ChoreItemData[]
  this_week: ChoreItemData[]
  later: ChoreItemData[]
}

function groupChores(chores: ChoreItemData[]): GroupedChores {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)

  const result: GroupedChores = { overdue: [], today: [], this_week: [], later: [] }

  for (const chore of chores) {
    if (!chore.next_due) {
      result.later.push(chore)
      continue
    }
    const due = new Date(chore.next_due)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      result.overdue.push(chore)
    } else if (diffDays === 0) {
      result.today.push(chore)
    } else if (dueDay < weekEnd) {
      result.this_week.push(chore)
    } else {
      result.later.push(chore)
    }
  }

  return result
}

const GROUP_META: Record<Group, { label: string; labelClass: string; emptyLabel?: string }> = {
  overdue: {
    label: 'Überfällig',
    labelClass: 'text-red-600',
  },
  today: {
    label: 'Heute fällig',
    labelClass: 'text-amber-600',
  },
  this_week: {
    label: 'Diese Woche',
    labelClass: 'text-gray-600',
  },
  later: {
    label: 'Später',
    labelClass: 'text-gray-400',
  },
}

const GROUP_ORDER: Group[] = ['overdue', 'today', 'this_week', 'later']

export function ChoreList({ chores, currentUserId, onComplete }: ChoreListProps) {
  if (chores.length === 0) {
    return (
      <div className="text-center py-10">
        <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-400">Keine Aufgaben vorhanden.</p>
      </div>
    )
  }

  const grouped = groupChores(chores)

  return (
    <div className="space-y-6">
      {GROUP_ORDER.map((group) => {
        const items = grouped[group]
        if (items.length === 0) return null
        const meta = GROUP_META[group]

        return (
          <div key={group}>
            <h3 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${meta.labelClass}`}>
              {meta.label}
              <span className="ml-1.5 font-normal normal-case text-gray-400">({items.length})</span>
            </h3>
            <div className="space-y-2">
              {items.map((chore) => (
                <ChoreItem
                  key={chore.id}
                  chore={chore}
                  currentUserId={currentUserId}
                  onComplete={onComplete}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
