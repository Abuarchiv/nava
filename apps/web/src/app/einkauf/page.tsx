import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { ShoppingList } from '@/components/features/ShoppingList'

export default async function EinkaufPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('wg_members')
    .select('wg_id')
    .eq('user_id', user.id)
    .limit(1)

  const wgId = memberships?.[0]?.wg_id
  if (!wgId) redirect('/onboarding')

  const { data: items } = await supabase
    .from('shopping_items')
    .select('*, profiles(display_name)')
    .eq('wg_id', wgId)
    .in('status', ['pending'])
    .order('created_at', { ascending: true })

  const { data: doneItems } = await supabase
    .from('shopping_items')
    .select('*, profiles(display_name)')
    .eq('wg_id', wgId)
    .eq('status', 'purchased')
    .order('purchased_at', { ascending: false })
    .limit(10)

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Einkaufsliste</h1>
          <p className="text-sm text-gray-500">
            {items?.length ?? 0} {(items?.length ?? 0) === 1 ? 'Sache' : 'Sachen'} ausstehend
          </p>
        </div>
        <Link href="/einkauf/neu" className="btn-primary text-sm px-3 py-2">
          <Plus className="w-4 h-4" />
          Hinzufügen
        </Link>
      </div>

      {items && items.length > 0 ? (
        <ShoppingList
          items={items as Parameters<typeof ShoppingList>[0]['items']}
          doneItems={(doneItems ?? []) as Parameters<typeof ShoppingList>[0]['doneItems']}
          userId={user.id}
          wgId={wgId}
        />
      ) : (
        <div className="card text-center py-10">
          <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-700">Einkaufsliste ist leer</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            Was fehlt in der WG? Füg es hinzu.
          </p>
          <Link href="/einkauf/neu" className="btn-primary text-sm inline-flex">
            <Plus className="w-4 h-4" />
            Eintrag hinzufügen
          </Link>
        </div>
      )}
    </div>
  )
}
