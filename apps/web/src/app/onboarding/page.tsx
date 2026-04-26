'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Users, ArrowRight, Loader2, Link2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Step = 'name' | 'choice' | 'create' | 'joining'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('name')
  const [displayName, setDisplayName] = useState('')
  const [wgName, setWgName] = useState('')
  const [wgAddress, setWgAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!displayName.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/login'); return }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)

    if (updateError) {
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: displayName.trim(),
        email: user.email ?? '',
      })
    }

    setLoading(false)
    setStep('choice')
  }

  async function handleCreateWG(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) { router.push('/login'); return }

    const { data: wg, error: wgError } = await supabase
      .from('wgs')
      .insert({ name: wgName.trim(), address: wgAddress.trim() || null, created_by: user.id })
      .select()
      .single()

    if (wgError) {
      setError('WG konnte nicht erstellt werden. Versuch es nochmal.')
      setLoading(false)
      return
    }

    const { error: memberError } = await supabase.from('wg_members').insert({
      wg_id: wg.id,
      user_id: user.id,
      role: 'admin',
    })

    if (memberError) {
      setError('Fehler beim Beitreten der WG.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const stepDots = (current: number) => (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`rounded-full transition-all ${
            i === current
              ? 'w-6 h-1.5 bg-[#3d5a3d]'
              : 'w-1.5 h-1.5 bg-[rgba(247,243,236,0.15)]'
          }`}
        />
      ))}
    </div>
  )

  const Wrapper = ({ children, step: s }: { children: React.ReactNode; step: number }) => (
    <div className="relative min-h-screen bg-[#1f1b16] flex flex-col items-center justify-center p-5 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,90,61,0.15)_0%,transparent_60%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-8">
          <span className="font-black text-2xl text-[#f7f3ec] tracking-[-0.04em]">nava</span>
        </Link>
        {children}
        {stepDots(s)}
      </div>
    </div>
  )

  if (step === 'name') {
    return (
      <Wrapper step={0}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#f7f3ec] tracking-[-0.03em]">Wie heißt du?</h1>
          <p className="text-sm text-[#9a8f7c] mt-2">Dein Name wird deinen Mitbewohnern angezeigt.</p>
        </div>

        <form onSubmit={handleSaveName} className="bg-[#2a241d] border border-[rgba(247,243,236,0.08)] rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#9a8f7c] uppercase tracking-wider mb-2">
              Dein Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="z.B. Max Mustermann"
              required
              maxLength={60}
              autoFocus
              className="w-full bg-[#1f1b16] border border-[rgba(247,243,236,0.12)] focus:border-[#3d5a3d] text-[#f7f3ec] placeholder-[#5c5447] rounded-xl px-3 py-3 text-sm outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-[#a03b2d]/25 border border-[#a03b2d]/40 rounded-xl px-4 py-3 text-sm text-[#e8a89a]">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="w-full bg-[#3d5a3d] hover:bg-[#2f4630] disabled:opacity-50 disabled:cursor-not-allowed text-[#fdfbf6] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Weiter <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>
      </Wrapper>
    )
  }

  if (step === 'choice') {
    return (
      <Wrapper step={1}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-[#f7f3ec] tracking-[-0.03em]">
            Hallo, {displayName.split(' ')[0]}!
          </h1>
          <p className="text-sm text-[#9a8f7c] mt-2">WG gründen oder einer bestehenden beitreten?</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setStep('create')}
            className="w-full bg-[#2a241d] border border-[rgba(247,243,236,0.08)] hover:border-[#3d5a3d] hover:bg-[rgba(61,90,61,0.1)] rounded-2xl p-4 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#e8ede3] rounded-xl flex items-center justify-center group-hover:bg-[#3d5a3d] transition-colors">
                <Home className="w-5 h-5 text-[#3d5a3d] group-hover:text-[#fdfbf6] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#f7f3ec] text-sm">WG erstellen</p>
                <p className="text-[11px] text-[#9a8f7c] mt-0.5">Neue WG anlegen und Mitbewohner einladen</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#5c5447] group-hover:text-[#8aa885] transition-colors" />
            </div>
          </button>

          <button
            onClick={() => setStep('joining')}
            className="w-full bg-[#2a241d] border border-[rgba(247,243,236,0.08)] hover:border-[#c4694a] hover:bg-[rgba(196,105,74,0.06)] rounded-2xl p-4 text-left transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#f5e6dc] rounded-xl flex items-center justify-center group-hover:bg-[#c4694a] transition-colors">
                <Users className="w-5 h-5 text-[#c4694a] group-hover:text-[#fdfbf6] transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#f7f3ec] text-sm">WG beitreten</p>
                <p className="text-[11px] text-[#9a8f7c] mt-0.5">Einladungslink von Mitbewohnern öffnen</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#5c5447] group-hover:text-[#c4694a] transition-colors" />
            </div>
          </button>
        </div>
      </Wrapper>
    )
  }

  if (step === 'create') {
    return (
      <Wrapper step={2}>
        <button
          onClick={() => setStep('choice')}
          className="text-sm text-[#9a8f7c] hover:text-[#f7f3ec] mb-6 flex items-center gap-1 transition-colors"
        >
          ← Zurück
        </button>

        <div className="bg-[#2a241d] border border-[rgba(247,243,236,0.08)] rounded-2xl p-6">
          <h1 className="text-xl font-black text-[#f7f3ec] tracking-[-0.03em] mb-1">Eure WG.</h1>
          <p className="text-sm text-[#9a8f7c] mb-6">Wie soll deine WG heißen?</p>

          <form onSubmit={handleCreateWG} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#9a8f7c] uppercase tracking-wider mb-2">
                WG-Name *
              </label>
              <input
                type="text"
                value={wgName}
                onChange={(e) => setWgName(e.target.value)}
                placeholder="z.B. WG Südstadt"
                required
                maxLength={100}
                className="w-full bg-[#1f1b16] border border-[rgba(247,243,236,0.12)] focus:border-[#3d5a3d] text-[#f7f3ec] placeholder-[#5c5447] rounded-xl px-3 py-3 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#9a8f7c] uppercase tracking-wider mb-2">
                Adresse <span className="text-[#5c5447] font-normal normal-case">(optional)</span>
              </label>
              <input
                type="text"
                value={wgAddress}
                onChange={(e) => setWgAddress(e.target.value)}
                placeholder="Musterstraße 12, Karlsruhe"
                maxLength={200}
                className="w-full bg-[#1f1b16] border border-[rgba(247,243,236,0.12)] focus:border-[#3d5a3d] text-[#f7f3ec] placeholder-[#5c5447] rounded-xl px-3 py-3 text-sm outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-[#a03b2d]/25 border border-[#a03b2d]/40 rounded-xl px-4 py-3 text-sm text-[#e8a89a]">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading || !wgName.trim()}
              className="w-full bg-[#3d5a3d] hover:bg-[#2f4630] disabled:opacity-50 disabled:cursor-not-allowed text-[#fdfbf6] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>WG erstellen <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper step={2}>
      <button
        onClick={() => setStep('choice')}
        className="text-sm text-[#9a8f7c] hover:text-[#f7f3ec] mb-6 flex items-center gap-1 transition-colors"
      >
        ← Zurück
      </button>

      <div className="bg-[#2a241d] border border-[rgba(247,243,236,0.08)] rounded-2xl p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-[#f5e6dc] flex items-center justify-center mx-auto mb-5">
          <Link2 className="w-6 h-6 text-[#c4694a]" />
        </div>
        <h1 className="text-xl font-black text-[#f7f3ec] tracking-[-0.03em] mb-2">Einladungslink öffnen.</h1>
        <p className="text-sm text-[#9a8f7c] leading-relaxed">
          Bitte deine Mitbewohner, dir den Einladungslink zu schicken. Öffne den Link — du bist sofort drin.
        </p>
        <p className="mt-4 text-xs text-[#5c5447] font-mono bg-[#1f1b16] rounded-xl px-3 py-2.5 border border-[rgba(247,243,236,0.06)]">
          nava-app.vercel.app/join/abc123...
        </p>
      </div>
    </Wrapper>
  )
}
