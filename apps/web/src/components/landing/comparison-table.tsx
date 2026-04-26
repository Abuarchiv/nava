'use client';

import { motion } from './motion';
import { Check, X, Minus } from 'lucide-react';

type Cell = 'yes' | 'no' | 'half';

const rows: { feature: string; splitwise: Cell; wggesucht: Cell; nava: Cell }[] = [
  { feature: 'Kein Abo, kein Pay-Wall', splitwise: 'half', wggesucht: 'no', nava: 'yes' },
  { feature: 'Unbegrenzte Mitbewohner', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
  { feature: 'DSGVO, Server in DE', splitwise: 'no', wggesucht: 'half', nava: 'yes' },
  { feature: 'Putzplan inklusive', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
  { feature: 'Einkaufsliste geteilt', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
  { feature: 'Kein Tracking, keine Werbung', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
  { feature: 'Daten echt löschbar', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
  { feature: 'Kein Investor', splitwise: 'no', wggesucht: 'no', nava: 'yes' },
];

function Mark({ kind }: { kind: Cell }) {
  if (kind === 'yes') {
    return (
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
        style={{
          backgroundColor: 'rgba(132, 225, 188, 0.14)',
          boxShadow: '0 0 14px rgba(132, 225, 188, 0.3), inset 0 0 0 1px rgba(132, 225, 188, 0.4)',
        }}
      >
        <Check className="h-3.5 w-3.5 text-[var(--accent)]" strokeWidth={3} />
      </span>
    );
  }
  if (kind === 'half') {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--amber)]/40 bg-[var(--amber)]/10">
        <Minus className="h-3.5 w-3.5 text-[var(--amber)]" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.02]">
      <X className="h-3.5 w-3.5 text-[var(--text-3)]" strokeWidth={2.4} />
    </span>
  );
}

export function ComparisonTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl glass gradient-border"
    >
      {/* header */}
      <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 border-b border-white/[0.08] px-6 py-5 md:px-10">
        <div className="label-mono">FEATURE</div>
        <div className="label-mono text-center">Splitwise</div>
        <div className="label-mono text-center">WG-Gesucht</div>
        <div className="label-mono text-center text-[var(--accent)]">nava</div>
      </div>

      {/* rows */}
      <div>
        {rows.map((row, i) => (
          <motion.div
            key={row.feature}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
            className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 items-center px-6 py-4 md:px-10 border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.015]"
          >
            <div className="text-[15px] font-medium text-[var(--text-1)]">{row.feature}</div>
            <div className="flex justify-center">
              <Mark kind={row.splitwise} />
            </div>
            <div className="flex justify-center">
              <Mark kind={row.wggesucht} />
            </div>
            <div className="flex justify-center">
              <Mark kind={row.nava} />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
