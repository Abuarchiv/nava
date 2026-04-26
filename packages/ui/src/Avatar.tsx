import React from 'react'

interface AvatarProps {
  name: string
  src?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
}

// Palette of distinct background colors for initials
const COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-600',
  'bg-green-600',
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-sky-500',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-fuchsia-600',
  'bg-pink-600',
  'bg-rose-600',
]

function hashName(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return hash
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0 || parts[0] === '') return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function getColor(name: string): string {
  return COLORS[hashName(name) % COLORS.length]
}

export function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const initials = getInitials(name)
  const colorClass = getColor(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={[
          'rounded-full object-cover flex-shrink-0',
          sizeClasses[size],
        ].join(' ')}
      />
    )
  }

  return (
    <span
      aria-label={name}
      className={[
        'inline-flex items-center justify-center rounded-full flex-shrink-0',
        'font-medium text-white select-none',
        sizeClasses[size],
        colorClass,
      ].join(' ')}
    >
      {initials}
    </span>
  )
}
