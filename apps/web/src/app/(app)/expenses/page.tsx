'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useExpenses } from '@nava/core'
import type { SupabaseClient as NavaSupabaseClient } from '@nava/supabase'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { BalanceCard } from '@/components/expenses/BalanceCard'
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal'
import { SettlementModal } from '@/components/expenses/SettlementModal'
import type { ExpenseItemData } from '@/components/expenses/ExpenseItem'
import type { BalancePerson } from '@/components/expenses/BalanceCard'
import type { WGMember } from '@/components/expenses/AddExpenseModal'

type Filter = 'all' | 'month' | '3months'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Alle',
  month: 'Diesen Monat',
  '3months': 'Letzte 3 Monate',
}

export default function ExpensesPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [wgId, setWgId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)

  // Resolve user & WG on mount
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: memberships } = await supabase
        .from('wg_members')
        .select('wg_id')
        .eq('user_id', user.id)
        .limit(1)

      const wg = memberships?.[0]?.wg_id
      if (!wg) { router.push('/onboarding'); return }
      setWgId(wg)
      setAuthLoading(false)
    }
    void init()
  }, [supabase, router])

  const { data, isLoading, refetch } = useExpenses(
    wgId ?? '',
    supabase as unknown as NavaSupabaseClient,
  )

  // Build WGMember list for modals
  const members: WGMember[] = useMemo(() => {
    if (!data) return []
    return data.members.map((m) => ({
      userId: m.user_id,
      displayName: m.profiles?.display_name ?? 'Unbekannt',
    }))
  }, [data])

  // Filter expenses by date
  const filteredExpenses = useMemo((): ExpenseItemData[] => {
    if (!data || !userId) return []

    const now = new Date()
    const cutoff = filter === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : filter === '3months'
      ? new Date(now.getFullYear(), now.getMonth() - 2, 1)
      : null

    return data.expenses
      .filter((e) => {
        if (!cutoff) return true
        return new Date(e.paid_on) >= cutoff
      })
      .map((e) => {
        const mySplit = e.expense_splits.find((s) => s.user_id === userId)
        return {
          id: e.id,
          description: e.description,
          amount: e.amount,
          paid_on: e.paid_on,
          category_slug: e.expense_categories?.slug ?? null,
          payer_name: e.profiles?.display_name ?? 'Unbekannt',
          payer_is_me: e.paid_by === userId,
          my_share: mySplit?.share_amount ?? 0,
        }
      })
  }, [data, userId, filter])

  // Build balance data for the card
  const myBalance = useMemo(() => {
    if (!data || !userId) return 0
    return data.balances.find((b) => b.userId === userId)?.balance ?? 0
  }, [data, userId])

  const otherBalances = useMemo((): BalancePerson[] => {
    if (!data || !userId) return []
    // From my perspective: positive = they owe me, negative = I owe them
    return data.balances
      .filter((b) => b.userId !== userId)
      .map((b) => ({
        userId: b.userId,
        displayName: b.displayName,
        avatarUrl: b.avatarUrl,
        // If their balance is negative (they owe the group = they owe me)
        // We need to compute bilateral: use simplifyDebts perspective
        // Simplest: just show their balance inverted relative to mine
        balance: -b.balance,
      }))
  }, [data, userId])

  function handleSuccess() {
    setShowAddModal(false)
    setShowSettlementModal(false)
    void refetch()
  }

  const loading = authLoading || isLoading

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Ausgaben</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm px-3 py-2"
        >
          <Plus className="w-4 h-4" />
          Ausgabe
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Balance Overview */}
          {data && data.members.length > 1 && (
            <BalanceCard
              myBalance={myBalance}
              others={otherBalances}
              onSettle={() => setShowSettlementModal(true)}
            />
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === f
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Expense List */}
          <ExpenseList
            expenses={filteredExpenses}
            onExpenseClick={(id) => router.push(`/ausgaben/${id}`)}
          />
        </>
      )}

      {/* Add Expense Modal */}
      {showAddModal && wgId && userId && (
        <AddExpenseModal
          wgId={wgId}
          currentUserId={userId}
          members={members}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Settlement Modal */}
      {showSettlementModal && wgId && data && (
        <SettlementModal
          wgId={wgId}
          balances={data.balances}
          onClose={() => setShowSettlementModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
