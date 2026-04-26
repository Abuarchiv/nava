'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Euro,
  CalendarCheck,
  ShoppingCart,
  Megaphone,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/ausgaben', icon: Euro, label: 'Ausgaben' },
  { href: '/putzen', icon: CalendarCheck, label: 'Putzplan' },
  { href: '/einkauf', icon: ShoppingCart, label: 'Einkaufen' },
  { href: '/pinnwand', icon: Megaphone, label: 'Pinnwand' },
]

interface SidebarProps {
  wgName: string
  userName: string
  userEmail: string
}

export function Sidebar({ wgName, userName, userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-[#f7f3ec] border-r border-[#ddd4c2] z-30">
      {/* Logo + WG-Name */}
      <div className="h-16 flex items-center px-5 border-b border-[#ddd4c2]">
        <Link href="/dashboard" className="block min-w-0">
          <p className="font-black text-[18px] text-[#1f1b16] tracking-[-0.03em] leading-none">
            nava
          </p>
          <p className="text-[11px] text-[#9a8f7c] truncate mt-1">{wgName}</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors',
                active
                  ? 'bg-[#e8ede3] text-[#3d5a3d] font-medium'
                  : 'text-[#5c5447] hover:text-[#1f1b16] hover:bg-[#ede7da]',
              )}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                strokeWidth={active ? 2 : 1.75}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Einstellungen + User */}
      <div className="border-t border-[#ddd4c2] px-3 py-3 space-y-1">
        <Link
          href="/einstellungen"
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-colors',
            pathname.startsWith('/einstellungen')
              ? 'bg-[#e8ede3] text-[#3d5a3d] font-medium'
              : 'text-[#5c5447] hover:text-[#1f1b16] hover:bg-[#ede7da]',
          )}
        >
          <Settings
            className="w-4 h-4 shrink-0"
            strokeWidth={pathname.startsWith('/einstellungen') ? 2 : 1.75}
          />
          Einstellungen
        </Link>

        {/* User-Info */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-[#3d5a3d] flex items-center justify-center shrink-0">
            <span className="text-[#fdfbf6] text-[11px] font-bold tracking-tight">
              {initials}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1f1b16] truncate leading-tight">
              {userName}
            </p>
            <p className="text-[11px] text-[#9a8f7c] truncate leading-tight mt-0.5">
              {userEmail}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#9a8f7c] hover:text-[#1f1b16] hover:bg-[#ede7da] transition-colors"
            title="Abmelden"
            aria-label="Abmelden"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </aside>
  )
}
