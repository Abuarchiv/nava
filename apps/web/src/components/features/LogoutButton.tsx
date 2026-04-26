'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 rounded-xl py-3 text-sm font-medium hover:bg-red-50 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Abmelden
    </button>
  )
}
