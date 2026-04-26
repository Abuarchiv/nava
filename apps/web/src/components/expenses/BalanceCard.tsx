'use client'

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatCurrency, getInitials, getAvatarColor } from '@/lib/utils'

export interface BalancePerson {
  userId: string
  displayName: string
  avatarUrl: string | null
  balance: number // positive = owes ME, negative = I owe THEM
}

interface BalanceCardProps {
  myBalance: number
  others: BalancePerson[]
  onSettle: () => void
}

export function BalanceCard({ myBalance, others, onSettle }: BalanceCardProps) {
  const withDebts = others.filter((p) => Math.abs(p.balance) > 0.01)
  const hasDebts = withDebts.length > 0

  return (
    <div className="card mb-5">
      {/* My total balance */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dein Saldo</p>
          <p
            className={`text-2xl font-bold mt-0.5 ${
              myBalance > 0.01
                ? 'text-emerald-600'
                : myBalance < -0.01
                ? 'text-red-600'
                : 'text-gray-900'
            }`}
          >
            {myBalance > 0.01 && '+'}
            {formatCurrency(myBalance)}
          </p>
        </div>
        {hasDebts && (
          <button
            type="button"
            onClick={onSettle}
            className="btn-primary text-sm px-3 py-2"
          >
            Alle ausgleichen
          </button>
        )}
      </div>

      {/* Per-person rows */}
      {withDebts.length > 0 ? (
        <div className="space-y-3 border-t border-gray-100 pt-3">
          {withDebts.map((person) => {
            const owesMe = person.balance > 0
            return (
              <div key={person.userId} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${getAvatarColor(person.displayName)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                >
                  {getInitials(person.displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{person.displayName}</p>
                  <p className={`text-xs ${owesMe ? 'text-emerald-600' : 'text-red-600'}`}>
                    {owesMe
                      ? `schuldet dir ${formatCurrency(person.balance)}`
                      : `du schuldest ${formatCurrency(Math.abs(person.balance))}`}
                  </p>
                </div>
                {owesMe ? (
                  <div className="flex items-center gap-1 text-emerald-600 flex-shrink-0">
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{formatCurrency(person.balance)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 flex-shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span className="text-sm font-semibold">{formatCurrency(Math.abs(person.balance))}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-2 border-t border-gray-100 pt-3">
          Alle sind quitt. 🎉
        </p>
      )}
    </div>
  )
}
