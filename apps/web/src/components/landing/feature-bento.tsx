'use client';

import { motion } from './motion';
import { Receipt, Sparkles, ShoppingBag, PinIcon, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

const cardTransition = { type: 'spring' as const, damping: 22, stiffness: 200 };

function BentoCard({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: cardTransition }}
      className={`group relative overflow-hidden rounded-3xl glass gradient-border p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function CardLabel({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 label-mono text-[var(--text-2)]">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse-glow" />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {children as any}
    </div>
  );
}

/* ─── animated mini visuals per card ─── */

function ExpensesVisual() {
  const rows = [
    { who: 'Lea', amt: '+47,20 €', tone: 'mint' },
    { who: 'Max', amt: '−12,40 €', tone: 'pink' },
    { who: 'Jonas', amt: '+8,90 €', tone: 'mint' },
    { who: 'Hannah', amt: '−43,70 €', tone: 'pink' },
  ];
  return (
    <div className="relative mt-8 space-y-2.5">
      {rows.map((r, i) => (
        <motion.div
          key={r.who}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.08, duration: 0.5 }}
          className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3"
        >
          <span className="font-medium text-[var(--text-1)]">{r.who}</span>
          <span
            className="font-mono text-sm tabular-nums"
            style={{
              color: r.tone === 'mint' ? '#84e1bc' : '#f472b6',
            }}
          >
            {r.amt}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function ChoresVisual() {
  const tasks = [
    { name: 'Bad', who: 'Lea', done: true },
    { name: 'Küche', who: 'Max', done: true },
    { name: 'Flur', who: 'Jonas', done: false },
    { name: 'Müll', who: 'Hannah', done: false },
  ];
  return (
    <div className="relative mt-8 grid grid-cols-2 gap-2.5">
      {tasks.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.07, type: 'spring', damping: 18 }}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-1)]">{t.name}</span>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                t.done
                  ? 'bg-[var(--accent)] text-[var(--bg-base)]'
                  : 'border border-white/20 text-transparent'
              }`}
            >
              ✓
            </span>
          </div>
          <div className="label-mono mt-2 text-[10px]">{t.who}</div>
        </motion.div>
      ))}
    </div>
  );
}

function ShoppingVisual() {
  const items = [
    { name: 'Klopapier', done: true },
    { name: 'Hafermilch', done: true },
    { name: 'Spülmaschinen-Tabs', done: false },
    { name: 'Olivenöl', done: false },
  ];
  return (
    <div className="relative mt-8 space-y-2">
      {items.map((it, i) => (
        <motion.div
          key={it.name}
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 + i * 0.06, duration: 0.4 }}
          className="flex items-center gap-3 rounded-lg px-2 py-2"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-md border ${
              it.done
                ? 'border-[var(--accent)] bg-[var(--accent)]/20'
                : 'border-white/20'
            }`}
          >
            {it.done && (
              <span className="text-[9px] text-[var(--accent)]">✓</span>
            )}
          </span>
          <span
            className={`text-sm ${
              it.done
                ? 'text-[var(--text-3)] line-through decoration-[var(--text-3)]/60'
                : 'text-[var(--text-1)]'
            }`}
          >
            {it.name}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function PinboardVisual() {
  const notes = [
    { text: 'Hausmeister kommt Di 10 Uhr', color: '#84e1bc', rot: -3 },
    { text: 'Heizung Wartung erledigt', color: '#8b5cf6', rot: 2 },
    { text: 'Schwester pennt am Wochenende', color: '#f472b6', rot: -1.5 },
  ];
  return (
    <div className="relative mt-8 space-y-3">
      {notes.map((n, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, rotate: 0 }}
          whileInView={{ opacity: 1, y: 0, rotate: n.rot }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 + i * 0.1, type: 'spring', damping: 14 }}
          className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur"
          style={{
            boxShadow: `0 0 0 1px ${n.color}33, 0 4px 20px ${n.color}22`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm text-[var(--text-1)]">{n.text}</span>
            <span
              className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: n.color, boxShadow: `0 0 12px ${n.color}` }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── main grid ─── */

export function FeatureBento() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:auto-rows-[minmax(0,1fr)]">
      {/* TILE 1 — large hero, spans 4 cols, 2 rows — Ausgaben */}
      <BentoCard className="md:col-span-4 md:row-span-2 min-h-[440px]" delay={0}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <CardLabel>// 01 — AUSGABEN</CardLabel>
            <h3 className="mt-5 text-3xl md:text-4xl font-semibold tracking-[-0.04em] leading-[0.96] text-[var(--text-1)]">
              Wer schuldet wem was.{' '}
              <span className="text-gradient">Live.</span>
            </h3>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-2)]">
              Tipp ein, was du gezahlt hast. Nava rechnet automatisch — wer hat
              ausgelegt, wer schuldet, wer kriegt was zurück. Ein Klick: erledigt.
            </p>
          </div>
          <ExpensesVisual />
        </div>
        <Receipt
          className="absolute -bottom-6 -right-6 h-32 w-32 text-[var(--accent)] opacity-[0.07]"
          strokeWidth={1.2}
        />
      </BentoCard>

      {/* TILE 2 — top right, spans 2 cols, 1 row — Putzplan */}
      <BentoCard className="md:col-span-2 md:row-span-1 min-h-[210px]" delay={0.1}>
        <CardLabel>// 02 — PUTZPLAN</CardLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] leading-[0.96] text-[var(--text-1)]">
          Rotiert{' '}
          <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
            fair
          </span>
          .
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
          Bad, Küche, Flur — wer dran ist, weiß es. Urlaub übersprungen.
        </p>
        <Sparkles
          className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--violet)] opacity-[0.08]"
          strokeWidth={1.2}
        />
      </BentoCard>

      {/* TILE 3 — middle right, spans 2 cols 1 row — Pinnwand mini */}
      <BentoCard className="md:col-span-2 md:row-span-1 min-h-[210px]" delay={0.18}>
        <CardLabel>// 03 — PINNWAND</CardLabel>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] leading-[0.96] text-[var(--text-1)]">
          Drei Zeilen.{' '}
          <span className="text-gradient">Alle sehen's.</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
          Statt Whatsapp-Chaos: ein Kühlschrank, digital.
        </p>
        <PinIcon
          className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--pink)] opacity-[0.08]"
          strokeWidth={1.2}
        />
      </BentoCard>

      {/* TILE 4 — bottom left, span 3 cols — Einkaufsliste */}
      <BentoCard className="md:col-span-3 md:row-span-1 min-h-[300px]" delay={0.22}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <CardLabel>// 04 — EINKAUFSLISTE</CardLabel>
            <h3 className="mt-4 text-2xl md:text-3xl font-semibold tracking-[-0.04em] leading-[0.96] text-[var(--text-1)]">
              Eine Liste. Für{' '}
              <span className="italic font-normal text-gradient" style={{ fontFamily: "'Instrument Serif', serif" }}>
                alle
              </span>
              .
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
              Wer einkauft, hakt ab. Bezahlt? Wandert direkt in die Ausgaben.
            </p>
          </div>
          <ShoppingVisual />
        </div>
        <ShoppingBag
          className="absolute -bottom-4 -right-4 h-24 w-24 text-[var(--accent)] opacity-[0.08]"
          strokeWidth={1.2}
        />
      </BentoCard>

      {/* TILE 5 — bottom right, span 3 cols — Pinnwand bigger */}
      <BentoCard className="md:col-span-3 md:row-span-1 min-h-[300px]" delay={0.3}>
        <div className="flex h-full flex-col justify-between">
          <div>
            <CardLabel>// 05 — KÜHLSCHRANK-NOTIZEN</CardLabel>
            <h3 className="mt-4 text-2xl md:text-3xl font-semibold tracking-[-0.04em] leading-[0.96] text-[var(--text-1)]">
              Was{' '}
              <span className="italic font-normal" style={{ fontFamily: "'Instrument Serif', serif" }}>
                jeder
              </span>{' '}
              wissen muss.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-2)]">
              Kein „hab ich nicht gesehen" mehr. Augen-Symbole zeigen wer schon gelesen hat.
            </p>
          </div>
          <PinboardVisual />
        </div>
        <ArrowUpRight
          className="absolute right-5 top-5 h-5 w-5 text-[var(--text-3)] transition-all group-hover:text-[var(--accent)] group-hover:translate-x-1 group-hover:-translate-y-1"
          strokeWidth={2}
        />
      </BentoCard>
    </div>
  );
}
