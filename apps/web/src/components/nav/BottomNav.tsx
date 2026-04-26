'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Euro, CalendarCheck, ShoppingCart, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/ausgaben', icon: Euro, label: 'Ausgaben' },
  { href: '/putzen', icon: CalendarCheck, label: 'Putzen' },
  { href: '/einkauf', icon: ShoppingCart, label: 'Einkauf' },
  { href: '/pinnwand', icon: Megaphone, label: 'Pinnwand' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfbf6]/95 backdrop-blur-xl border-t border-[#ddd4c2] pb-safe">
      <div className="grid grid-cols-5 h-14">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                'relative flex items-center justify-center transition-colors',
                active ? 'text-[#3d5a3d]' : 'text-[#9a8f7c] hover:text-[#1f1b16]',
              )}
            >
              <Icon
                className="w-[22px] h-[22px]"
                strokeWidth={active ? 2 : 1.5}
              />
              {active && (
                <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3d5a3d]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
