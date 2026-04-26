'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CalendarCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials, getAvatarColor, cn } from '@/lib/utils'

interface Chore {
  id: string
  title: string
  description: string | null
  frequency: string
  assigned_to: string | null
  next_due: string | null
}

interface Props {
  chore: Chore
  profile: { display_name: string; avatar_url: string | null } | null
  isCurrentUser: boolean
  freqLabel: Record<string, string>
  userId: string
}

export function ChoreCard({ chore, profile, isCurrentUser, freqLabel, userId }: Props) {
  const router = useRouter()
  const [marking, setMarking] = useState(false)

  const isOverdue = chore.next_due && new Date(chore.next_due) < new Date()
  const name = profile?.display_name ?? 'Unzugewiesen'

  async function markDone() {
    setMarking(true)
    const supabase = createClient()

    // Calculate next due date
    const nextDue = new Date()
    const freqDays: Record<string, number> = {
      daily: 1, weekly: 7, biweekly: 14, monthly: 30
    }
    nextDue.setDate(nextDue.getDate() + (freqDays[chore.frequency] ?? 7))

    await supabase
      .from('chores')
      .update({ next_due: nextDue.toISOString().split('T')[0] })
      .eq('id', chore.id)

    setMarking(false)
    router.refresh()
  }

  return (
    <div className={cn(
      'card flex items-center gap-3',
      isOverdue && 'border-amber-300 bg-amber-50/50',
      isCurrentUser && 'border-indigo-200',
    )}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{chore.title}</p>
          {isOverdue && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
              Überfällig
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{freqLabel[chore.frequency] ?? chore.frequency}</span>
          {chore.next_due && (
            <span>
              {new Date(chore.next_due).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
            </span>
          )}
          {profile && (
            <div className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white`} style={{ fontSize: '8px' }}>
                {getInitials(name)[0]}
              </div>
              <span>{isCurrentUser ? 'Du' : name.split(' ')[0]}</span>
            </div>
          )}
        </div>
      </div>

      {isCurrentUser && (
        <button
          onClick={markDone}
          disabled={marking}
          className={cn(
            'w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0',
            'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 active:bg-indigo-100',
          )}
        >
          {marking ? (
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4 text-indigo-500" />
          )}
        </button>
      )}
    </div>
  )
}
