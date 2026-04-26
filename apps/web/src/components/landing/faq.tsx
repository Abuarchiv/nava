'use client';

import { AnimatePresence } from 'framer-motion';
import { motion } from './motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'Was ist das Geschäftsmodell?',
    a: 'Es gibt keins. Wir sind vier Studenten, die nava für unsere eigenen WGs gebaut haben. Der Frankfurter Server kostet uns rund 12 € im Monat — das tragen wir selbst. Keine Investoren, keine Datenverkäufe, keine Werbung. Wenn das eines Tages nicht mehr trägt, sagen wir es ehrlich.',
  },
  {
    q: 'Wie viele Mitbewohner kann eine WG haben?',
    a: 'Beliebig viele. Splitwise limitiert dich auf 5 Einträge pro Tag im Free-Plan. WG-Gesucht hat gar keine WG-Funktion. Bei nava: füge zwölf Leute hinzu, niemand zuckt.',
  },
  {
    q: 'Was passiert mit meinen Daten, wenn ich aufhöre?',
    a: 'Ein Klick auf „WG löschen". Alles weg. Echte Löschung — nicht „inaktiv markiert für 18 Monate". DSGVO heißt: deine Daten gehören dir, und „löschen" heißt löschen.',
  },
  {
    q: 'Kann ich den Quellcode einsehen?',
    a: 'Ja. Der Code liegt offen — du kannst ihn lesen, prüfen und Bugs melden. Was du nicht darfst: nava 1:1 für ein eigenes Produkt klonen oder kommerziell weiterverwerten. Lizenz: Source-available, kein MIT. Pull Requests sind willkommen, kommerzielle Forks nicht.',
  },
  {
    q: 'Funktioniert nava auf dem Handy?',
    a: 'Ja. Es ist eine Progressive Web App — installierbar auf iOS und Android über den Browser-Share-Knopf („zum Home-Bildschirm hinzufügen"). Wir bauen keine native App, weil eine PWA für eine WG-Liste völlig reicht und weniger Energie verbraucht.',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start justify-between gap-6 border-b border-white/[0.08] py-7 text-left transition-colors hover:border-white/20"
      >
        <span className="text-lg md:text-xl font-medium text-[var(--text-1)] tracking-[-0.02em]">
          {q}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] text-[var(--text-2)] group-hover:border-[var(--accent)]/40 group-hover:text-[var(--accent)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-[58ch] pb-7 pt-1 text-base leading-relaxed text-[var(--text-2)]">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  return (
    <div className="w-full">
      {faqs.map((f, i) => (
        <FAQItem key={f.q} q={f.q} a={f.a} index={i} />
      ))}
    </div>
  );
}
