'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, variant: ToastVariant) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, variant) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 4000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

// Öffentlicher Hook
export function useToast() {
  const { addToast } = useToastStore()
  return {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    info: (message: string) => addToast(message, 'info'),
  }
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle; iconClass: string; barClass: string }
> = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-emerald-500',
    barClass: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-500',
    barClass: 'bg-red-500',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    barClass: 'bg-blue-500',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore()
  const { icon: Icon, iconClass, barClass } = variantConfig[toast.variant]

  return (
    <div
      role="alert"
      aria-live="polite"
      className="relative flex items-start gap-3 rounded-xl bg-white shadow-lg border border-gray-100 px-4 py-3 overflow-hidden min-w-[280px] max-w-sm"
    >
      {/* Farbbalken links */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', barClass)} />

      <Icon className={cn('w-5 h-5 mt-0.5 shrink-0 ml-1', iconClass)} />

      <p className="flex-1 text-sm text-gray-800 leading-snug">{toast.message}</p>

      <button
        type="button"
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Benachrichtigung schließen"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Auto-dismiss Fortschrittsbalken */}
      <div
        className={cn('absolute bottom-0 left-0 h-0.5', barClass, 'animate-toast-progress')}
        style={{ animationDuration: '4000ms' }}
      />
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none sm:bottom-6 sm:items-end sm:right-4 sm:left-auto"
      aria-label="Benachrichtigungen"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  )
}

// ToastProvider — nur für globale Bereitstellung des Containers
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}
