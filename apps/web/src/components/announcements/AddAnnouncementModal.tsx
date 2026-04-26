'use client'

import { useState, useRef, type FormEvent } from 'react'
import { Modal } from '@nava/ui'
import { Pin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreateAnnouncementInput } from '@nava/types'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: Omit<CreateAnnouncementInput, 'wg_id' | 'posted_by'>) => void
  loading?: boolean
}

export function AddAnnouncementModal({ open, onClose, onSubmit, loading = false }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [pinned, setPinned] = useState(false)
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({})
  const titleRef = useRef<HTMLInputElement>(null)

  function validate(): boolean {
    const newErrors: typeof errors = {}
    if (!title.trim()) newErrors.title = 'Titel ist erforderlich'
    if (!content.trim()) newErrors.content = 'Inhalt ist erforderlich'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ title: title.trim(), content: content.trim(), pinned })
  }

  function handleClose() {
    if (loading) return
    setTitle('')
    setContent('')
    setPinned(false)
    setErrors({})
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Neue Ankündigung">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Titel */}
        <div className="flex flex-col gap-1">
          <label htmlFor="ann-title" className="text-sm font-medium text-gray-700">
            Titel <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleRef}
            id="ann-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="z. B. Putzdienst diese Woche"
            maxLength={120}
            disabled={loading}
            aria-invalid={errors.title ? 'true' : undefined}
            aria-describedby={errors.title ? 'ann-title-error' : undefined}
            className={cn(
              'block w-full rounded-lg border bg-white text-gray-900 text-sm px-3 py-2.5',
              'placeholder:text-gray-400 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
            )}
          />
          {errors.title && (
            <p id="ann-title-error" className="text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        {/* Inhalt */}
        <div className="flex flex-col gap-1">
          <label htmlFor="ann-content" className="text-sm font-medium text-gray-700">
            Inhalt <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ann-content"
            rows={5}
            value={content}
            onChange={(e) => {
              setContent(e.target.value)
              if (errors.content) setErrors((prev) => ({ ...prev, content: undefined }))
            }}
            placeholder="Was soll deine WG wissen?"
            disabled={loading}
            aria-invalid={errors.content ? 'true' : undefined}
            aria-describedby={errors.content ? 'ann-content-error' : undefined}
            className={cn(
              'block w-full rounded-lg border bg-white text-gray-900 text-sm px-3 py-2.5',
              'placeholder:text-gray-400 transition-colors duration-150 resize-none',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'disabled:bg-gray-50 disabled:cursor-not-allowed',
              errors.content ? 'border-red-500 focus:ring-red-500' : 'border-gray-300',
            )}
          />
          {errors.content && (
            <p id="ann-content-error" className="text-sm text-red-600">
              {errors.content}
            </p>
          )}
        </div>

        {/* Anpinnen Toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={pinned}
          onClick={() => setPinned((prev) => !prev)}
          disabled={loading}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors',
            pinned
              ? 'border-amber-400 bg-amber-50 text-amber-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
          )}
        >
          <div className="flex items-center gap-2.5">
            <Pin className={cn('w-4 h-4', pinned ? 'text-amber-600' : 'text-gray-400')} />
            <div className="text-left">
              <p className="text-sm font-medium">Anpinnen</p>
              <p className="text-xs text-gray-400">Erscheint ganz oben für alle</p>
            </div>
          </div>
          {/* Toggle knob */}
          <div
            className={cn(
              'w-10 h-6 rounded-full transition-colors flex items-center px-0.5',
              pinned ? 'bg-amber-500' : 'bg-gray-200',
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full bg-white shadow-sm transition-transform',
                pinned ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </div>
        </button>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 btn-ghost text-sm py-2.5"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary text-sm py-2.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Wird gepostet…
              </span>
            ) : (
              'Ankündigung posten'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
