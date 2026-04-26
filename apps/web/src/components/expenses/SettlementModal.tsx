'use client'

import { useState } from 'react'
import { X, Loader2, CheckCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { simplifyDebts } from '@nava/core'
import { formatCurrency, getInitials, getAvatarColor } from '@/lib/utils'
import type { UserBalance, SettlementSuggestion } from '@nava/types'

interface SettlementModalProps {
  wgId: string
  balances: UserBalance[]
  onClose: () => void
  onSuccess: () => void
}

export function SettlementModal({
  wgId,
  balances,
  onClose,
  onSuccess,
}: SettlementModalProps) {
  const suggestions: SettlementSuggestion[] = simplifyDebts(balances)

  const [settled, setSettled] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function markPaid(index: number, suggestion: SettlementSuggestion) {
    setLoading(index)
    setError(null)
    const supabase = createClient()

    try {
      const { error: err } = await supabase.from('settlements').insert({
        wg_id: wgId,
        from_user: suggestion.from.userId,
        to_user: suggestion.to.userId,
        amount: suggestion.amount,
        description: 'Schuldenausgleich',
      })
      if (err) throw err

      setSettled((prev) => new Set([...prev, index]))
    } catch {
      setError('Konnte nicht als bezahlt markiert werden.')
    } finally {
      setLoading(null)
    }
  }

  const allDone = settled.size === suggestions.length && suggestions.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[85dvh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-900">Schulden ausgleichen</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {suggestions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Alles ausgeglichen!</p>
              <p className="text-sm text-gray-400 mt-1">Keine offenen Schulden.</p>
            </div>
          ) : allDone ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">Alle Zahlungen markiert!</p>
              <p className="text-sm text-gray-400 mt-1">Super, ihr seid alle quitt.</p>
              <button
                type="button"
                onClick={() => { onSuccess(); onClose() }}
                className="btn-primary mt-4 text-sm px-5"
              >
                Fertig
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 pb-1">
                Optimierte Zahlungsvorschläge — minimale Anzahl an Überweisungen:
              </p>

              {suggestions.map((s, i) => {
                const isDone = settled.has(i)
                const isLoading = loading === i

                return (
                  <div
                    key={i}
                    className={`card transition-opacity ${isDone ? 'opacity-40' : ''}`}
                  >
                    {/* From → To */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-9 h-9 rounded-full ${getAvatarColor(s.from.displayName)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {getInitials(s.from.displayName)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {s.from.displayName}
                        </p>
                        <p className="text-xs text-gray-500">zahlt an {s.to.displayName}</p>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />

                      <div
                        className={`w-9 h-9 rounded-full ${getAvatarColor(s.to.displayName)} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                      >
                        {getInitials(s.to.displayName)}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3 text-center">
                      <span className="text-xl font-bold text-gray-900">
                        {formatCurrency(s.amount)}
                      </span>
                    </div>

                    {/* Action */}
                    {isDone ? (
                      <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium py-1">
                        <CheckCircle className="w-4 h-4" />
                        Als bezahlt markiert
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => markPaid(i, s)}
                        className="btn-primary text-sm w-full"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Als bezahlt markieren'
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
