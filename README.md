<div align="center">

# nava

### Die WG-App, die einfach funktioniert.

Ausgaben teilen. Putzplan rotieren. Einkaufsliste teilen. Pinnwand für alle.
**In Deutschland gehostet. Ohne Tracking. Ohne Werbung. Ohne Investor.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-nava.app-84e1bc?style=for-the-badge)](https://nava.app)
[![License: PolyForm Noncommercial](https://img.shields.io/badge/License-PolyForm%20Noncommercial-c44536?style=for-the-badge)](./LICENSE)
[![Made with Next.js](https://img.shields.io/badge/Next.js-15-000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![DSGVO konform](https://img.shields.io/badge/DSGVO-konform-3d5a3d?style=for-the-badge)](#datenschutz)

![Nava — Die WG-App](./docs/screenshots/hero.png)

</div>

---

## Was ist nava?

Eine WG-App, die vier Werkzeuge in einer Oberfläche bündelt — gebaut für deutsche
Wohngemeinschaften, ohne den Bullshit, den Splitwise und Co. mitbringen.

| Modul | Was es löst |
|---|---|
| **Ausgaben** | Wer schuldet wem was. Live, fair, automatisch verrechnet. |
| **Putzplan** | Rotiert von selbst. Bad, Küche, Flur, Müll — wer dran ist, weiß es. |
| **Einkaufsliste** | Eine Liste für alle. Wer einkauft, hakt ab. Bezahltes wandert in die Ausgaben. |
| **Pinnwand** | Drei Zeilen, alle sehen's. Statt WhatsApp-Chaos: ein digitaler Kühlschrank. |

---

## Warum nava?

Die meisten Alternativen bringen Probleme mit:

- **Splitwise** wurde 2025 verkauft, der Free-Plan ist auf 5 Einträge pro Tag limitiert.
- **WG-Gesucht** verlangt 9,90 €/Monat und hat keine WG-Verwaltungs-Funktion.
- **Notion-Templates** zerfallen nach acht Wochen, weil Notion sich ständig ändert.

Nava ist anders:

- **Server in Frankfurt** — DSGVO-konform, daten löschbar (echt, nicht „inaktiv für 18 Monate")
- **Kein Tracking, keine Werbung, kein Investor** — wir verkaufen weder eure Daten noch euch
- **Keine Limits** — vier, acht, zwölf Mitbewohner sind egal
- **Quellcode prüfbar** — du kannst nachsehen, was wir mit deinen Daten tun

---

## Tech-Stack

- **Next.js 15** (App Router, Server Components)
- **React 19** mit React Three Fiber für die 3D-Hero-Szene
- **Supabase** (Postgres + Auth + Realtime) — Server in Frankfurt
- **Tailwind CSS** + **Framer Motion** + **Lenis** (Smooth Scroll)
- **TypeScript** end-to-end
- **Turborepo** (Monorepo: `apps/web`, `apps/mobile`, `packages/*`)

---

## Lizenz: Source-available, **nicht** MIT

Nava ist **nicht** klassisch Open Source. Wir benutzen die
[**PolyForm Noncommercial 1.0.0**](./LICENSE) — eine
Source-available-Lizenz mit folgendem Modell:

### ✅ Was du darfst

- Den Quellcode lesen, prüfen, studieren
- Nava für deine eigene WG selbst hosten
- Forken für Forschung, Bildung, gemeinnützige Zwecke
- Bugs melden, Pull Requests einreichen

### ❌ Was du nicht darfst

- Nava 1:1 klonen und als kommerzielles Produkt betreiben
- Den Code in einem zahlungspflichtigen Service verwenden
- Eine kommerzielle Konkurrenz-WG-App auf Basis dieses Codes anbieten

**Warum keine MIT-Lizenz?** Wir bauen nava nebenbei, ohne Investor.
Eine freie Lizenz würde es trivial machen, den Code zu kopieren und
als „Premium" zu vermarkten. Source-available bedeutet: Transparenz für
Nutzer, Schutz für die Maintainer.

Für kommerzielle Lizenzanfragen: [Issue eröffnen](https://github.com/Abuarchiv/nava/issues/new).

---

## Selbst hosten

> Hinweis: Self-Hosting ist erlaubt für nicht-kommerzielle Zwecke (eure eigene WG, ein Verein, ein Studentenwohnheim).

```bash
# Clone
git clone https://github.com/Abuarchiv/nava.git
cd nava

# Install (pnpm)
pnpm install

# Setup
cp apps/web/.env.example apps/web/.env.local
# Fülle Supabase-Keys ein

# Run
pnpm dev
```

Voraussetzungen:

- Node.js 20+
- pnpm 9+
- Supabase-Projekt (kostenloses Tier reicht)

---

## Roadmap

- [x] Ausgaben-Splitting mit fairer Abrechnung
- [x] Rotierender Putzplan mit Urlaubs-Übersprung
- [x] Geteilte Einkaufsliste, automatische Auslagen-Verbuchung
- [x] WG-Pinnwand mit Lese-Bestätigungen
- [ ] Mobile App (PWA → installierbar auf iOS/Android)
- [ ] Mehrsprachigkeit (EN, FR)
- [ ] iCal-Export für Putzplan
- [ ] Optional: WhatsApp-/Telegram-Bot

---

## Mitwirken

Pull Requests sind willkommen — vor allem für:

- Bugfixes
- Übersetzungen
- Barrierefreiheit
- DSGVO-/Datenschutz-Verbesserungen

Bitte beachte die [Lizenz](./LICENSE) — Beiträge werden unter denselben Bedingungen
aufgenommen.

---

## Datenschutz

- **Server in Frankfurt** (Hetzner Cloud)
- **Keine Tracker, keine Pixel, keine Cookies** außer dem Auth-Cookie
- **Keine Werbung, kein Profiling**
- **Daten echt löschbar** mit einem Klick — DSGVO Artikel 17
- **Datensparsam** — wir speichern nur, was nava zum Funktionieren braucht

Vollständige Datenschutzerklärung: [nava.app/datenschutz](https://nava.app/datenschutz).

---

## Community

- **Issues:** [github.com/Abuarchiv/nava/issues](https://github.com/Abuarchiv/nava/issues)
- **Discussions:** [github.com/Abuarchiv/nava/discussions](https://github.com/Abuarchiv/nava/discussions)

---

<div align="center">

**Vier Studenten, ein Server in Frankfurt, keine Investoren.**

© 2026 nava. PolyForm Noncommercial 1.0.0.

</div>
