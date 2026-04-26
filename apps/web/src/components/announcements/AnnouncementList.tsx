'use client'

import { AnnouncementCard } from './AnnouncementCard'
import type { AnnouncementWithProfile } from '@nava/types'

interface Props {
  announcements: AnnouncementWithProfile[]
  currentUserId: string
  isAdmin: boolean
  onPin: (id: string, pinned: boolean) => void
  onDelete: (id: string) => void
  pinningId?: string | null
  deletingId?: string | null
}

export function AnnouncementList({
  announcements,
  currentUserId,
  isAdmin,
  onPin,
  onDelete,
  pinningId,
  deletingId,
}: Props) {
  const pinned = announcements.filter((a) => a.pinned)
  const unpinned = announcements.filter((a) => !a.pinned)

  if (announcements.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-3xl mb-3">📋</p>
        <p className="font-medium text-gray-700">Noch keine Ankündigungen</p>
        <p className="text-sm text-gray-400 mt-1">
          Wichtige Infos für alle — einfach oben posten.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Gepinnte Ankündigungen */}
      {pinned.length > 0 && (
        <section aria-label="Gepinnte Ankündigungen">
          <h2 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2 px-0.5">
            📌 Gepinnt
          </h2>
          <div className="space-y-3">
            {pinned.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onPin={onPin}
                onDelete={onDelete}
                pinning={pinningId === a.id}
                deleting={deletingId === a.id}
              />
            ))}
          </div>
        </section>
      )}

      {/* Chronologische Liste */}
      {unpinned.length > 0 && (
        <section aria-label="Alle Ankündigungen">
          {pinned.length > 0 && (
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-0.5">
              Alle Ankündigungen
            </h2>
          )}
          <div className="space-y-3">
            {unpinned.map((a) => (
              <AnnouncementCard
                key={a.id}
                announcement={a}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onPin={onPin}
                onDelete={onDelete}
                pinning={pinningId === a.id}
                deleting={deletingId === a.id}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
