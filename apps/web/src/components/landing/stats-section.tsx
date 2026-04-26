'use client';

import { useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { motion } from './motion';
import { useEffect, useRef } from 'react';

function CountUp({
  to,
  suffix = '',
  prefix = '',
  duration = 2,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => `${prefix}${Math.round(v).toLocaleString('de-DE')}${suffix}`);

  useEffect(() => {
    if (inView) {
      const ctrl = animate(count, to, {
        duration,
        ease: [0.22, 1, 0.36, 1],
      });
      return () => ctrl.stop();
    }
  }, [inView, count, to, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export function StatsSection() {
  const stats = [
    {
      value: <span>DE</span>,
      label: 'Server in Frankfurt',
      sub: 'DSGVO-konform. Daten löschbar. Kein US-Cloud-Anbieter.',
    },
    {
      value: <span>∞</span>,
      label: 'Mitbewohner pro WG',
      sub: 'Vier, acht, zwölf — egal. Keine Limits, keine Tarif-Stufen.',
    },
    {
      value: <CountUp to={0} suffix="" duration={1.4} />,
      label: 'Tracker, Pixel, Cookies',
      sub: 'Keine Werbung, kein Profiling. Eure Daten bleiben bei euch.',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ delay: i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div
            className="font-semibold tabular-nums leading-[0.92] tracking-[-0.05em] text-gradient"
            style={{
              fontSize: 'clamp(72px, 9vw, 144px)',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            {s.value}
          </div>
          <div className="mt-4 text-lg font-medium text-[var(--text-1)] tracking-[-0.01em]">
            {s.label}
          </div>
          <div className="mt-2 text-sm text-[var(--text-2)] leading-relaxed max-w-[28ch]">
            {s.sub}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
