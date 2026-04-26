'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Fehler beim Senden. Versuch es nochmal.')
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    setError(null)

    const supabase = createClient()
    const origin = window.location.origin

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Google-Anmeldung fehlgeschlagen.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#1f1b16] flex items-center justify-center p-5 overflow-hidden">
      {/* Background glow — warmes Moss statt kalt-violett */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(61,90,61,0.18)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-8">
          <span className="font-black text-2xl text-[#f7f3ec] tracking-[-0.04em]">
            nava
          </span>
        </Link>

        {/* Card */}
        <div className="bg-[#2a241d] border border-[rgba(247,243,236,0.08)] rounded-2xl p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#e8ede3] flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-7 h-7 text-[#3d5a3d]" />
              </div>
              <h1 className="text-2xl font-black text-[#f7f3ec] tracking-[-0.03em] mb-2">
                Check dein Postfach.
              </h1>
              <p className="text-[#9a8f7c] text-sm leading-relaxed mb-8">
                Magic Link geschickt an{' '}
                <span className="text-[#f7f3ec] font-medium">{email}</span>. Klick
                rein.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
                className="text-sm text-[#8aa885] hover:text-[#c4694a] transition-colors"
              >
                ← Andere E-Mail verwenden
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-[#f7f3ec] tracking-[-0.03em] mb-1">
                Anmelden.
              </h1>
              <p className="text-[#9a8f7c] text-sm mb-7">
                Magic Link — kein Passwort nötig.
              </p>

              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-semibold text-[#9a8f7c] uppercase tracking-wider mb-2"
                  >
                    E-Mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5c5447] pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="deine@email.de"
                      required
                      autoComplete="email"
                      className="w-full bg-[#1f1b16] border border-[rgba(247,243,236,0.12)] focus:border-[#3d5a3d] text-[#f7f3ec] placeholder-[#5c5447] rounded-xl px-3 py-3 pl-9 text-sm outline-none transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-[#a03b2d]/25 border border-[#a03b2d]/40 rounded-xl px-4 py-3 text-sm text-[#e8a89a]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3d5a3d] hover:bg-[#2f4630] disabled:opacity-50 disabled:cursor-not-allowed text-[#fdfbf6] font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Magic Link senden
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-[rgba(247,243,236,0.06)]" />
                <span className="text-[10px] text-[#5c5447] uppercase tracking-wider">
                  oder
                </span>
                <div className="flex-1 h-px bg-[rgba(247,243,236,0.06)]" />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                className="w-full border border-[rgba(247,243,236,0.12)] hover:bg-[rgba(247,243,236,0.04)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 text-sm text-[#b8ac93] hover:text-[#f7f3ec] transition-colors flex items-center justify-center gap-2.5 font-medium"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Mit Google anmelden
                  </>
                )}
              </button>

              <p className="text-sm text-[#5c5447] mt-6 text-center">
                Noch kein Konto?{' '}
                <Link
                  href="/register"
                  className="text-[#8aa885] hover:text-[#c4694a] font-medium transition-colors"
                >
                  Registrieren →
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Bottom trust signal */}
        <p className="text-center text-[#5c5447] text-xs mt-6">
          100% kostenlos · Open Source · MIT-Lizenz
        </p>
      </div>
    </div>
  )
}
