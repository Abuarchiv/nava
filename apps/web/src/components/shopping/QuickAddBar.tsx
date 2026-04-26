'use client'

import { useState, useRef } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onAdd: (name: string) => Promise<void>
  disabled?: boolean
}

export function QuickAddBar({ onAdd, disabled }: Props) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = value.trim()
    if (!name || loading || disabled) return
    setLoading(true)
    try {
      await onAdd(name)
      setValue('')
      inputRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pb-safe lg:bottom-6 pointer-events-none">
      <form
        onSubmit={handleSubmit}
        className={cn(
          'max-w-lg mx-auto flex items-center gap-2',
          'bg-white rounded-2xl shadow-xl border border-gray-200',
          'px-4 py-3 pointer-events-auto',
          'transition-opacity duration-200',
          disabled && 'opacity-60',
        )}
      >
        <Plus className="w-5 h-5 text-gray-400 flex-shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled || loading}
          placeholder="Artikel hinzufügen..."
          enterKeyHint="send"
          autoComplete="off"
          className={cn(
            'flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent',
            'focus:outline-none',
            'disabled:cursor-not-allowed',
          )}
        />

        <button
          type="submit"
          disabled={!value.trim() || loading || disabled}
          aria-label="Hinzufügen"
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center',
            'transition-all duration-150',
            value.trim() && !loading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          )}
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  )
}
