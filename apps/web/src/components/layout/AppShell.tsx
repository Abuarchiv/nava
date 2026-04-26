'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Euro, CalendarCheck, ShoppingCart, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/ausgaben', icon: Euro, label: 'Ausgaben' },
  { href: '/putzen', icon: CalendarCheck, label: 'Putzen' },
  { href: '/einkauf', icon: ShoppingCart, label: 'Einkauf' },
  { href: '/einstellungen', icon: Settings, label: 'Mehr' },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <span className="font-bold text-gray-900">nava</span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-14 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe">
        <div className="grid grid-cols-5 h-14">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 transition-colors',
                  active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className={cn('w-5 h-5', active && 'stroke-2')} />
                <span className="text-[10px] font-medium">{label}</span>
                {active && (
                  <span className="absolute bottom-0 w-6 h-0.5 bg-indigo-600 rounded-t-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
