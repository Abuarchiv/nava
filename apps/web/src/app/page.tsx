import Link from 'next/link';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import { LenisProvider } from '@/components/landing/lenis-provider';
import { Hero3D } from '@/components/landing/hero-3d';
import { ScrollFade } from '@/components/landing/scroll-fade';
import { FeatureBento } from '@/components/landing/feature-bento';
import { StatsSection } from '@/components/landing/stats-section';
import { ComparisonTable } from '@/components/landing/comparison-table';
import { FAQ } from '@/components/landing/faq';

export default function LandingPage() {
  return (
    <LenisProvider>
      <main className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-1)]">
        {/* ─── NAV ─────────────────────────────────────────── */}
        <nav className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full glass-strong px-5 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="text-xl font-extrabold tracking-[-0.04em]"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                nava
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" />
                <span className="label-mono text-[10px] text-[var(--text-2)]">v1.0</span>
              </span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
                Features
              </a>
              <a href="#vergleich" className="text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
                Vergleich
              </a>
              <a href="#faq" className="text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]">
                FAQ
              </a>
              <a
                href="https://github.com/Abuarchiv/nava"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center px-3 py-1.5 text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text-1)]"
              >
                Anmelden
              </Link>
              <Link href="/register" className="btn-modern !py-2 !px-4 text-[13px]">
                WG starten
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative mesh-bg spotlight min-h-screen overflow-hidden pt-32 pb-20">
          {/* grid backdrop */}
          <div className="absolute inset-0 grid-pattern grid-mask opacity-50" aria-hidden />

          {/* 3D scene — fills hero, behind content */}
          <div className="absolute inset-0 z-0">
            <Hero3D />
          </div>

          {/* aurora blob */}
          <div
            className="absolute left-1/2 top-1/3 -z-0 h-[640px] w-[640px] -translate-x-1/2 rounded-full opacity-30 animate-aurora"
            style={{
              background:
                'radial-gradient(circle, rgba(132,225,188,0.4) 0%, rgba(139,92,246,0.2) 40%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            aria-hidden
          />

          <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-5 pt-12 text-center md:pt-20">
            {/* kicker */}
            <ScrollFade immediate>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 backdrop-blur">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
                </span>
                <span className="label-mono text-[10px] text-[var(--text-1)]">
                  Für deutsche Wohngemeinschaften
                </span>
              </div>
            </ScrollFade>

            {/* headline */}
            <ScrollFade immediate delay={0.1} y={32}>
              <h1
                className="mt-10 font-extrabold leading-[0.92] tracking-[-0.05em]"
                style={{
                  fontSize: 'clamp(56px, 9vw, 144px)',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                <span className="block text-gradient-mint">Die WG-App,</span>
                <span className="block">
                  die einfach{' '}
                  <span
                    className="italic font-normal text-gradient"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    funktioniert
                  </span>
                  .
                </span>
              </h1>
            </ScrollFade>

            {/* subhead */}
            <ScrollFade immediate delay={0.25} y={20}>
              <p className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-[var(--text-2)] md:text-xl">
                Ausgaben teilen, Putzplan rotieren, Einkaufsliste teilen, Pinnwand für alle.
                <span className="text-[var(--text-1)]"> In Deutschland gehostet. Ohne Tracking. Ohne Werbung.</span>
              </p>
            </ScrollFade>

            {/* CTA row */}
            <ScrollFade immediate delay={0.4}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="btn-modern">
                  WG starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com/Abuarchiv/nava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-modern-ghost"
                >
                  <Github className="h-4 w-4" />
                  Quellcode lesen
                </a>
              </div>
            </ScrollFade>

            {/* tiny social proof line */}
            <ScrollFade immediate delay={0.55}>
              <div className="mt-8 flex items-center gap-3 label-mono text-[10px] text-[var(--text-3)]">
                <Sparkles className="h-3 w-3 text-[var(--accent)]" />
                4 Werkzeuge · Unbegrenzte Mitbewohner · DSGVO-konform
              </div>
            </ScrollFade>

            {/* scroll indicator */}
            <div className="mt-24 flex flex-col items-center gap-2 opacity-60">
              <span className="label-mono text-[10px]">SCROLL</span>
              <div className="h-12 w-px bg-gradient-to-b from-[var(--text-3)] to-transparent" />
            </div>
          </div>
        </section>

        {/* ─── FEATURES BENTO ─────────────────────────────────────── */}
        <section
          id="features"
          className="relative px-5 py-32 md:py-40"
        >
          <div className="mx-auto max-w-7xl">
            <ScrollFade>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[var(--accent)]" />
                <span className="label-mono text-[var(--accent)]">// FEATURES</span>
              </div>
            </ScrollFade>

            <ScrollFade delay={0.1}>
              <h2
                className="mt-6 max-w-3xl font-extrabold leading-[0.96] tracking-[-0.045em]"
                style={{
                  fontSize: 'clamp(40px, 6vw, 88px)',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                Vier Werkzeuge.{' '}
                <span className="text-gradient">Mehr braucht keine WG.</span>
              </h2>
            </ScrollFade>

            <ScrollFade delay={0.2}>
              <p className="mt-6 max-w-xl text-lg text-[var(--text-2)] leading-relaxed">
                Vier Module, die ineinandergreifen. Keine Add-ons, keine Tarif-Stufen,
                kein versteckter Funktionsumfang hinter Paywalls.
              </p>
            </ScrollFade>

            <div className="mt-16">
              <FeatureBento />
            </div>
          </div>
        </section>

        {/* ─── STATS / IMPACT ─────────────────────────────────────── */}
        <section className="relative px-5 py-32 md:py-40">
          <div
            className="absolute inset-x-0 top-0 -z-10 h-full"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(132,225,188,0.06), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="mx-auto max-w-7xl">
            <ScrollFade>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[var(--violet)]" />
                <span className="label-mono text-[var(--violet)]">// IMPACT</span>
              </div>
            </ScrollFade>

            <ScrollFade delay={0.1}>
              <h2
                className="mt-6 max-w-4xl font-extrabold leading-[0.96] tracking-[-0.045em]"
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 76px)',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                Vier Studenten,{' '}
                <span
                  className="italic font-normal text-gradient"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  ein
                </span>{' '}
                Server.
              </h2>
            </ScrollFade>

            <ScrollFade delay={0.2}>
              <p className="mt-6 max-w-xl text-lg text-[var(--text-2)] leading-relaxed">
                Wir hosten nava in Frankfurt, ohne Tracker, ohne Investor.
                Keine Werbung, kein Verkauf eurer Daten — ihr seid keine Ware.
              </p>
            </ScrollFade>

            <div className="mt-20">
              <StatsSection />
            </div>
          </div>
        </section>

        {/* ─── COMPARISON ─────────────────────────────────────── */}
        <section id="vergleich" className="relative px-5 py-32 md:py-40">
          <div className="mx-auto max-w-6xl">
            <ScrollFade>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-[var(--pink)]" />
                <span className="label-mono text-[var(--pink)]">// VERGLEICH</span>
              </div>
            </ScrollFade>

            <ScrollFade delay={0.1}>
              <h2
                className="mt-6 max-w-3xl font-extrabold leading-[0.96] tracking-[-0.045em]"
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 76px)',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                Nava vs. der Rest.
              </h2>
            </ScrollFade>

            <ScrollFade delay={0.2}>
              <p className="mt-6 max-w-xl text-lg text-[var(--text-2)] leading-relaxed">
                Splitwise wurde 2025 verkauft, der Free-Plan entkernt. WG-Gesucht hat keine
                WG-Funktion. Wir haben.
              </p>
            </ScrollFade>

            <div className="mt-16">
              <ComparisonTable />
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIAL / QUOTE ─────────────────────────────── */}
        <section className="relative overflow-hidden px-5 py-32 md:py-44">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(139,92,246,0.08), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="mx-auto max-w-5xl text-center">
            <ScrollFade>
              <div className="inline-flex items-center gap-2 label-mono text-[var(--text-3)]">
                <span className="h-px w-8 bg-[var(--text-3)]" />
                AUS DER PRAXIS
                <span className="h-px w-8 bg-[var(--text-3)]" />
              </div>
            </ScrollFade>

            <ScrollFade delay={0.15} y={32}>
              <blockquote
                className="mt-10 leading-[1.05] tracking-[-0.025em] text-balance text-[var(--text-1)]"
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 84px)',
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                }}
              >
                „Endlich keine WhatsApp-Gruppe um{' '}
                <span className="text-gradient">23 Uhr</span> mehr,
                in der jemand fragt wer beim Joghurt war."
              </blockquote>
            </ScrollFade>

            <ScrollFade delay={0.3}>
              <div className="mt-10 flex items-center justify-center gap-3">
                <span className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent)] via-[var(--violet)] to-[var(--pink)]" />
                <div className="text-left">
                  <div className="text-sm font-medium text-[var(--text-1)]">Lea M.</div>
                  <div className="label-mono text-[10px]">24 · BERLIN · 4er-WG</div>
                </div>
              </div>
            </ScrollFade>
          </div>
        </section>

        {/* ─── FAQ ─────────────────────────────────────── */}
        <section id="faq" className="relative px-5 py-32 md:py-40">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 md:grid-cols-[1fr_1.4fr]">
            <div>
              <ScrollFade>
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 bg-[var(--amber)]" />
                  <span className="label-mono text-[var(--amber)]">// FAQ</span>
                </div>
              </ScrollFade>

              <ScrollFade delay={0.1}>
                <h2
                  className="mt-6 font-extrabold leading-[0.96] tracking-[-0.045em] sticky top-32"
                  style={{
                    fontSize: 'clamp(36px, 4.5vw, 64px)',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Fragen, die kommen.
                </h2>
              </ScrollFade>

              <ScrollFade delay={0.2}>
                <p className="mt-6 max-w-sm text-base text-[var(--text-2)] leading-relaxed">
                  Wir sind erreichbar — auch wenn die Antwort schon hier steht. Schreib uns auf
                  GitHub oder via Mail.
                </p>
              </ScrollFade>
            </div>

            <div>
              <FAQ />
            </div>
          </div>
        </section>

        {/* ─── FINAL CTA ─────────────────────────────────────── */}
        <section className="relative overflow-hidden px-5 py-40 md:py-56">
          <div className="mesh-bg spotlight absolute inset-0 -z-10" aria-hidden />
          <div
            className="absolute left-1/2 top-1/2 -z-10 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 animate-aurora"
            style={{
              background:
                'radial-gradient(circle, rgba(132,225,188,0.5), rgba(139,92,246,0.25) 45%, transparent 75%)',
              filter: 'blur(60px)',
            }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-5xl text-center">
            <ScrollFade>
              <div className="label-mono text-[var(--accent)]">// JETZT</div>
            </ScrollFade>

            <ScrollFade delay={0.1} y={32}>
              <h2
                className="mt-8 font-extrabold leading-[0.92] tracking-[-0.05em]"
                style={{
                  fontSize: 'clamp(56px, 10vw, 168px)',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                <span className="block text-gradient-mint">Eure WG.</span>
                <span className="block">
                  Endlich{' '}
                  <span
                    className="italic font-normal text-gradient"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    sortiert
                  </span>
                  .
                </span>
              </h2>
            </ScrollFade>

            <ScrollFade delay={0.3}>
              <p className="mx-auto mt-8 max-w-lg text-lg text-[var(--text-2)] leading-relaxed">
                E-Mail eintippen, Mitbewohner einladen, loslegen. Keine Kreditkarte,
                kein Onboarding-Funnel, kein Verkaufsgespräch.
              </p>
            </ScrollFade>

            <ScrollFade delay={0.45}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="btn-modern !py-4 !px-8 text-base">
                  WG jetzt starten
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com/Abuarchiv/nava"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-modern-ghost !py-4 !px-8 text-base"
                >
                  <Github className="h-4 w-4" />
                  Auf GitHub
                </a>
              </div>
            </ScrollFade>

            <ScrollFade delay={0.55}>
              <div className="mt-10 label-mono text-[10px] text-[var(--text-3)]">
                Setup in unter einer Minute
              </div>
            </ScrollFade>
          </div>
        </section>

        {/* ─── FOOTER ─────────────────────────────────────── */}
        <footer className="relative border-t border-white/[0.06] px-5 py-12">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
              <span
                className="text-2xl font-extrabold tracking-[-0.04em]"
                style={{ fontFamily: "'Geist', sans-serif" }}
              >
                nava
              </span>
              <span className="label-mono text-[10px] text-[var(--text-3)]">
                © 2026 nava
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link href="/datenschutz" className="label-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                DATENSCHUTZ
              </Link>
              <Link href="/impressum" className="label-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                IMPRESSUM
              </Link>
              <a
                href="https://github.com/Abuarchiv/nava"
                target="_blank"
                rel="noopener noreferrer"
                className="label-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors"
              >
                GITHUB
              </a>
              <Link href="/login" className="label-mono text-[var(--text-2)] hover:text-[var(--text-1)] transition-colors">
                ANMELDEN
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </LenisProvider>
  );
}
