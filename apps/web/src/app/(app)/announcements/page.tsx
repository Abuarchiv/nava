'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement, usePinAnnouncement } from '@nava/core'
import { AnnouncementList } from '@/components/announcements/AnnouncementList'
import { AddAnnouncementModal } from '@/components/announcements/AddAnnouncementModal'
import { createClient } from '@/lib/supabase/client'
import type { CreateAnnouncementInput } from '@nava/types'

const supabase = createClient()

export default function AnnouncementsPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [wgId, setWgId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [pinningId, setPinningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Auth + WG laden
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: membership } = await supabase
        .from('wg_members')
        .select('wg_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!membership) return
      setWgId(membership.wg_id)
      setIsAdmin(membership.role === 'admin')
    }

    void load()
  }, [])

  // Hooks
  const { data: announcements = [], isLoading } = useAnnouncements(wgId ?? '', supabase)
  const { mutateAsync: createAnnouncement, isPending: creating } = useCreateAnnouncement(supabase)
  const { mutateAsync: deleteAnnouncement } = useDeleteAnnouncement(supabase)
  const { mutateAsync: pinAnnouncement } = usePinAnnouncement(supabase)

  async function handleCreate(data: Omit<CreateAnnouncementInput, 'wg_id' | 'posted_by'>) {
    if (!wgId || !userId) return
    await createAnnouncement({ ...data, wg_id: wgId, posted_by: userId })
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!wgId) return
    setDeletingId(id)
    try {
      await deleteAnnouncement({ id, wgId })
    } finally {
      setDeletingId(null)
    }
  }

  async function handlePin(id: string, pinned: boolean) {
    if (!wgId) return
    setPinningId(id)
    try {
      await pinAnnouncement({ id, pinned, wgId })
    } finally {
      setPinningId(null)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pinnwand</h1>
          <p className="text-sm text-gray-500">
            {isLoading
              ? 'Laden…'
              : announcements.length === 0
              ? 'Noch nichts hier'
              : `${announcements.length} Ankündigung${announcements.length !== 1 ? 'en' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          disabled={!wgId}
          className="btn-primary text-sm px-3 py-2"
        >
          <Plus className="w-4 h-4" />
          Ankündigung
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                  <div className="h-2.5 w-16 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-full bg-gray-100 rounded" />
              <div className="h-3 w-2/3 bg-gray-100 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : (
        <AnnouncementList
          announcements={announcements}
          currentUserId={userId ?? ''}
          isAdmin={isAdmin}
          onPin={handlePin}
          onDelete={handleDelete}
          pinningId={pinningId}
          deletingId={deletingId}
        />
      )}

      {/* Modal */}
      <AddAnnouncementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        loading={creating}
      />
    </div>
  )
}
