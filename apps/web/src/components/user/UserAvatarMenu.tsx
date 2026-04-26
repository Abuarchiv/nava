'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, DoorOpen, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'

interface UserAvatarMenuProps {
  displayName: string
  avatarUrl?: string | null
}

interface MenuItem {
  label: string
  icon: typeof User
  href?: string
  onClick?: () => void
  danger?: boolean
}

export function UserAvatarMenu({ displayName, avatarUrl }: UserAvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const initials = getInitials(displayName)
  const colorClass = getAvatarColor(displayName)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleLeaveWg = () => {
    router.push('/einstellungen?aktion=wg-verlassen')
    setOpen(false)
  }

  const menuItems: MenuItem[] = [
    {
      label: 'Profil',
      icon: User,
      href: '/einstellungen/profil',
    },
    {
      label: 'Einstellungen',
      icon: Settings,
      href: '/einstellungen',
    },
    {
      label: 'WG verlassen',
      icon: DoorOpen,
      onClick: handleLeaveWg,
      danger: true,
    },
    {
      label: 'Abmelden',
      icon: LogOut,
      onClick: handleSignOut,
      danger: true,
    },
  ]

  // Außerhalb-Klick schließt Menü
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Benutzermenü für ${displayName}`}
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold',
              colorClass,
            )}
          >
            {initials}
          </div>
        )}

        {/* Name */}
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          {displayName}
        </span>

        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-150',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 py-1 z-50 overflow-hidden"
        >
          {/* Name-Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon
            const base =
              'flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left'
            const colorCn = item.danger
              ? 'text-red-600 hover:bg-red-50'
              : 'text-gray-700 hover:bg-gray-50'

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={cn(base, colorCn)}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </a>
              )
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={item.onClick}
                className={cn(base, colorCn)}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
