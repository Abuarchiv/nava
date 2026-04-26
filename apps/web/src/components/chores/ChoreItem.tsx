'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { FrequencyBadge } from './FrequencyBadge'
import { ChoreCompletedBadge } from './ChoreCompletedBadge'

export interface ChoreItemData {
  id: string
  title: string
  description: string | null
  frequency: string
  assigned_to: string | null
  next_due: string | null
  completed_at?: string | null
  completed_by?: string | null
  profiles: { display_name: string; avatar_url: string | null } | null
}

interface ChoreItemProps {
  chore: ChoreItemData
  currentUserId: string
  completedByName?: string
  onComplete: (choreId: string) => Promise<void>
}

function formatDueDate(dateStr: string): { label: string; overdue: boolean } {
  const due = new Date(dateStr)
  const now = new Date()

  // Compare date-only (strip time)
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    const n = Math.abs(diffDays)
    return { label: `Überfällig seit ${n} ${n === 1 ? 'Tag' : 'Tagen'}`, overdue: true }
  }
  if (diffDays === 0) return { label: 'Heute', overdue: false }
  if (diffDays === 1) return { label: 'Morgen', overdue: false }
  return { label: `In ${diffDays} Tagen`, overdue: false }
}

export function ChoreItem({ chore, currentUserId, completedByName, onComplete }: ChoreItemProps) {
  const [completing, setCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const isCurrentUser = chore.assigned_to === currentUserId
  const name = chore.profiles?.display_name ?? 'Unzugewiesen'
  const due = chore.next_due ? formatDueDate(chore.next_due) : null
  const isCompleted = Boolean(chore.completed_at)

  async function handleComplete() {
    if (completing || isCompleted) return
    setCompleting(true)
    try {
      await onComplete(chore.id)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1400)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-white px-4 py-3 flex items-start gap-3 transition-all',
        due?.overdue && !isCompleted && 'border-red-200 bg-red-50/40',
        !due?.overdue && isCurrentUser && !isCompleted && 'border-indigo-200',
        isCompleted && 'border-emerald-200 bg-emerald-50/30 opacity-70',
        !due?.overdue && !isCurrentUser && !isCompleted && 'border-gray-200',
      )}
    >
      {/* Confetti overlay (CSS-only) */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti-burst"
              style={{
                background: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                transform: `rotate(${i * 30}deg) translateY(-32px)`,
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
      )}

      {/* Checkbox */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={completing || isCompleted || !isCurrentUser}
        aria-label="Aufgabe erledigen"
        className={cn(
          'mt-0.5 w-6 h-6 flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
          isCompleted
            ? 'border-emerald-400 bg-emerald-400'
            : isCurrentUser
            ? 'border-indigo-400 hover:border-indigo-600 hover:bg-indigo-50 active:scale-95 cursor-pointer'
            : 'border-gray-300 cursor-default',
          completing && 'animate-pulse',
        )}
      >
        {isCompleted && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {completing && !isCompleted && (
          <div className="w-2.5 h-2.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <p className={cn(
            'text-sm font-semibold text-gray-900',
            isCompleted && 'line-through text-gray-400',
          )}>
            {chore.title}
          </p>
          {due?.overdue && !isCompleted && (
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
              Überfällig
            </span>
          )}
        </div>

        {chore.description && (
          <p className="text-xs text-gray-500 mb-1.5 leading-relaxed">{chore.description}</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <FrequencyBadge frequency={chore.frequency} />

          {due && !isCompleted && (
            <span className={cn(
              'text-xs font-medium',
              due.overdue ? 'text-red-600' : due.label === 'Heute' ? 'text-amber-600' : 'text-gray-500',
            )}>
              {due.label}
            </span>
          )}

          {/* Assignee */}
          <div className="flex items-center gap-1 ml-auto">
            {chore.profiles?.avatar_url ? (
              <img
                src={chore.profiles.avatar_url}
                alt={name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  'inline-flex items-center justify-center w-5 h-5 rounded-full text-white font-semibold flex-shrink-0',
                  getAvatarColor(name),
                )}
                style={{ fontSize: '9px' }}
              >
                {getInitials(name)}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {isCurrentUser ? 'Du' : name.split(' ')[0]}
            </span>
          </div>
        </div>

        {isCompleted && completedByName && chore.completed_at && (
          <div className="mt-2">
            <ChoreCompletedBadge
              completedBy={chore.completed_by === currentUserId ? 'dir' : completedByName}
              completedAt={chore.completed_at}
            />
          </div>
        )}
      </div>
    </div>
  )
}
