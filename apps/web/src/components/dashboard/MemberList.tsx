'use client'

import { getInitials, getAvatarColor, formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface MemberWithBalance {
  id: string
  userId: string
  displayName: string
  avatarUrl: string | null
  balance: number
}

interface MemberListProps {
  members: MemberWithBalance[]
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Mitbewohner</h2>
        <span className="text-xs text-gray-400">{members.length} Personen</span>
      </div>

      <div className="space-y-2.5">
        {members.map((member) => {
          const initials = getInitials(member.displayName)
          const avatarColor = getAvatarColor(member.displayName)
          const isPositive = member.balance >= 0

          return (
            <div key={member.id} className="flex items-center gap-3">
              {/* Avatar */}
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.displayName}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                    avatarColor,
                  )}
                >
                  {initials}
                </div>
              )}

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.displayName}
                </p>
              </div>

              {/* Balance */}
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  member.balance === 0
                    ? 'text-gray-400'
                    : isPositive
                      ? 'text-emerald-600'
                      : 'text-red-600',
                )}
              >
                {member.balance === 0
                  ? '±0,00 €'
                  : `${isPositive ? '+' : ''}${formatCurrency(member.balance)}`}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
