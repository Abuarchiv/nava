import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, locale = 'de-DE', currency = 'EUR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHrs = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHrs / 24)

  if (diffSec < 60) return 'gerade eben'
  if (diffMin < 60) return `vor ${diffMin} Minute${diffMin === 1 ? '' : 'n'}`
  if (diffHrs < 24) return `vor ${diffHrs} Stunde${diffHrs === 1 ? '' : 'n'}`
  if (diffDays === 1) return 'gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return formatDate(date)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-indigo-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-sky-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-orange-500',
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function getAvatarHex(name: string): string {
  const hexColors = [
    '#6366f1', // indigo
    '#f43f5e', // rose
    '#10b981', // emerald
    '#f59e0b', // amber
    '#0ea5e9', // sky
    '#a855f7', // purple
    '#ec4899', // pink
    '#f97316', // orange
  ]
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return hexColors[hash % hexColors.length]
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}…`
}

export function generateInviteUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://nava-app.vercel.app'
  return `${base}/join/${token}`
}
