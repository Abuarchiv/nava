'use client'

import { useRef, type ChangeEvent, type FocusEvent, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface AmountInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  name?: string
  label?: string
  error?: string
}

export function AmountInput({
  value,
  onChange,
  onBlur,
  placeholder = '0,00',
  disabled = false,
  className,
  id,
  name,
  label,
  error,
}: AmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // Nur Ziffern, Komma und Punkt erlaubt
    const cleaned = raw.replace(/[^0-9.,]/g, '')
    // Maximal ein Trennzeichen
    const parts = cleaned.split(/[.,]/)
    if (parts.length > 2) return
    onChange(cleaned)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab',
      'Enter', ',', '.', 'Home', 'End',
    ]
    const isDigit = /^[0-9]$/.test(e.key)
    if (!isDigit && !allowed.includes(e.key) && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
    }
  }

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(',', '.')
    const num = parseFloat(raw)
    if (!isNaN(num)) {
      // Auf 2 Dezimalstellen formatieren, Komma als Dezimaltrenner
      onChange(num.toFixed(2).replace('.', ','))
    } else if (e.target.value === '') {
      onChange('')
    }
    onBlur?.()
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors',
          error
            ? 'border-red-400 focus-within:ring-2 focus-within:ring-red-400/30'
            : 'border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="text-base font-medium text-gray-500 select-none">€</span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={label ?? 'Betrag in Euro'}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  )
}
