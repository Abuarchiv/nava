'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CalendarCheck, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ChoreList } from '@/components/chores/ChoreList'
import { ChoreItem } from '@/components/chores/ChoreItem'
import { AddChoreModal, type WgMember } from '@/components/chores/AddChoreModal'
import type { ChoreItemData } from '@/components/chores/ChoreItem'
import type { Frequency } from '@/components/chores/AddChoreModal'

interface StatsData {
  dueToday: number
  dueThisWeek: number
}

function computeStats(chores: ChoreItemData[]): StatsData {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)

  let dueToday = 0
  let dueThisWeek = 0

  for (const chore of chores) {
    if (!chore.next_due) continue
    const due = new Date(chore.next_due)
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const diffDays = Math.round((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 0) dueToday++
    else if (dueDay < weekEnd) dueThisWeek++
  }

  return { dueToday, dueThisWeek }
}

export default function ChoresPage() {
  const router = useRouter()
  const [chores, setChores] = useState<ChoreItemData[]>([])
  const [members, setMembers] = useState<WgMember[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [wgId, setWgId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    const supabase = createClient()
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

    const [{ data: choresData }, { data: wgMembers }] = await Promise.all([
      supabase
        .from('chores')
        .select('*, profiles(display_name, avatar_url)')
        .eq('wg_id', wg)
        .order('next_due', { ascending: true }),
      supabase
        .from('wg_members')
        .select('user_id, profiles(display_name)')
        .eq('wg_id', wg),
    ])

    setChores(
      (choresData ?? []).map((c) => ({
        ...c,
        profiles: c.profiles as { display_name: string; avatar_url: string | null } | null,
      })),
    )

    setMembers(
      (wgMembers ?? []).map((m) => ({
        user_id: m.user_id,
        display_name: (m.profiles as { display_name: string } | null)?.display_name ?? 'Unbekannt',
      })),
    )

    setLoading(false)
  }, [router])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleComplete(choreId: string) {
    const supabase = createClient()
    const chore = chores.find((c) => c.id === choreId)
    if (!chore) return

    const freqDays: Record<string, number> = {
      daily: 1, weekly: 7, biweekly: 14, monthly: 30,
    }
    const nextDue = new Date()
    nextDue.setDate(nextDue.getDate() + (freqDays[chore.frequency] ?? 7))

    await supabase
      .from('chores')
      .update({
        next_due: nextDue.toISOString().split('T')[0],
        completed_at: new Date().toISOString(),
        completed_by: userId,
      })
      .eq('id', choreId)

    // Optimistic update
    setChores((prev) =>
      prev.map((c) =>
        c.id === choreId
          ? {
              ...c,
              next_due: nextDue.toISOString().split('T')[0],
              completed_at: new Date().toISOString(),
              completed_by: userId ?? undefined,
            }
          : c,
      ),
    )
  }

  async function handleAddChore(data: {
    title: string
    description: string | null
    frequency: Frequency
    assigned_to: string | null
    start_date: string
  }) {
    if (!wgId) throw new Error('Keine WG gefunden')
    const supabase = createClient()

    const freqDays: Record<string, number> = {
      daily: 1, weekly: 7, biweekly: 14, monthly: 30,
    }
    const nextDue = new Date(data.start_date)
    nextDue.setDate(nextDue.getDate() + (freqDays[data.frequency] ?? 7))

    const { error } = await supabase.from('chores').insert({
      wg_id: wgId,
      title: data.title,
      description: data.description,
      frequency: data.frequency,
      assigned_to: data.assigned_to,
      next_due: nextDue.toISOString().split('T')[0],
    })

    if (error) throw error
    await loadData()
  }

  const myChores = chores.filter((c) => c.assigned_to === userId)
  const stats = computeStats(chores)
  const overdueCount = chores.filter((c) => {
    if (!c.next_due) return false
    const due = new Date(c.next_due)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return due < today
  }).length

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Putzplan</h1>
          <p className="text-sm text-gray-500">
            {loading
              ? 'Wird geladen…'
              : chores.length === 0
              ? 'Noch keine Aufgaben'
              : `${chores.length} ${chores.length === 1 ? 'Aufgabe' : 'Aufgaben'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-primary text-sm px-3 py-2 inline-flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Aufgabe
        </button>
      </div>

      {/* Quick Stats */}
      {!loading && chores.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className={`card flex items-center gap-3 ${overdueCount > 0 ? 'border-red-200 bg-red-50/40' : ''}`}>
            {overdueCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            ) : (
              <CalendarCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <p className={`text-lg font-bold ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {overdueCount > 0 ? overdueCount : stats.dueToday}
              </p>
              <p className="text-xs text-gray-500">
                {overdueCount > 0 ? 'Überfällig' : 'Fällig heute'}
              </p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <CalendarCheck className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.dueThisWeek}</p>
              <p className="text-xs text-gray-500">Diese Woche</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : chores.length === 0 ? (
        <div className="card text-center py-10">
          <CalendarCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Noch kein Putzplan</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Leg Aufgaben an — Nava zeigt wer wann dran ist.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Erste Aufgabe
          </button>
        </div>
      ) : (
        <>
          {/* Meine Aufgaben */}
          {myChores.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Du bist dran
              </h2>
              <div className="space-y-2">
                {myChores.map((chore) => (
                  <ChoreItem
                    key={chore.id}
                    chore={chore}
                    currentUserId={userId ?? ''}
                    onComplete={handleComplete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Alle Aufgaben */}
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {myChores.length > 0 ? 'Alle Aufgaben' : 'Aufgaben'}
            </h2>
            <ChoreList
              chores={chores}
              currentUserId={userId ?? ''}
              onComplete={handleComplete}
            />
          </div>
        </>
      )}

      {/* Add Chore Modal */}
      <AddChoreModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        members={members}
        currentUserId={userId ?? ''}
        onSubmit={handleAddChore}
      />
    </div>
  )
}
