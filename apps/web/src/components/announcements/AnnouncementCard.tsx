'use client'

import { useState } from 'react'
import { Pin, Trash2 } from 'lucide-react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import type { AnnouncementWithProfile } from '@nava/types'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return 'gerade eben'
  if (diffMins < 60) return `vor ${diffMins} Minute${diffMins !== 1 ? 'n' : ''}`
  if (diffHours < 24) return `vor ${diffHours} Stunde${diffHours !== 1 ? 'n' : ''}`
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface Props {
  announcement: AnnouncementWithProfile
  currentUserId: string
  isAdmin: boolean
  onPin: (id: string, pinned: boolean) => void
  onDelete: (id: string) => void
  pinning?: boolean
  deleting?: boolean
}

export function AnnouncementCard({
  announcement,
  currentUserId,
  isAdmin,
  onPin,
  onDelete,
  pinning = false,
  deleting = false,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const profile = announcement.profiles
  const name = profile?.display_name ?? 'Unbekannt'
  const isOwner = announcement.posted_by === currentUserId
  const canAct = isAdmin || isOwner

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(announcement.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  return (
    <article
      className={cn(
        'card relative',
        announcement.pinned && 'border-amber-300 bg-amber-50/60',
      )}
    >
      {/* Gepinnt-Badge */}
      {announcement.pinned && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          📌 Angepinnt
        </span>
      )}

      {/* Author + Meta */}
      <div className="flex items-center gap-2.5 mb-3 pr-24">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
            getAvatarColor(name),
          )}
        >
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {isOwner ? 'Du' : name}
          </p>
          <p className="text-xs text-gray-400">
            {formatRelativeTime(announcement.created_at)}
          </p>
        </div>
      </div>

      {/* Titel */}
      <h3 className="text-base font-bold text-gray-900 mb-1.5 leading-snug">
        {announcement.title}
      </h3>

      {/* Inhalt */}
      <p className="text-sm text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
        {announcement.content}
      </p>

      {/* Aktionen */}
      {canAct && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          {/* Pin-Toggle */}
          <button
            onClick={() => onPin(announcement.id, !announcement.pinned)}
            disabled={pinning}
            aria-label={announcement.pinned ? 'Anpinnen entfernen' : 'Ankündigung anpinnen'}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors',
              announcement.pinned
                ? 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                : 'text-gray-500 hover:text-amber-700 hover:bg-amber-50',
              pinning && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Pin className="w-3.5 h-3.5" />
            {announcement.pinned ? 'Lösen' : 'Anpinnen'}
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            onBlur={() => setConfirmDelete(false)}
            disabled={deleting}
            aria-label="Ankündigung löschen"
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ml-auto',
              confirmDelete
                ? 'text-white bg-red-600 hover:bg-red-700'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50',
              deleting && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {confirmDelete ? 'Wirklich löschen?' : 'Löschen'}
          </button>
        </div>
      )}
    </article>
  )
}
