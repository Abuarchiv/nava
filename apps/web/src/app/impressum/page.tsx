import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Impressum</h1>
        <p className="text-sm text-gray-500 mb-8">Angaben gemäß § 5 TMG</p>

        <div className="text-sm text-gray-700 space-y-6">
          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Betreiber</h2>
            <p>Abubakar Abditube</p>
            <p>Karlsruhe, Deutschland</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Kontakt</h2>
            <p>E-Mail: <a href="mailto:abubakarabditube@gmail.com" className="text-indigo-600 hover:underline">abubakarabditube@gmail.com</a></p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Haftungsausschluss</h2>
            <p>Nava ist ein Open-Source-Projekt ohne kommerzielle Absicht. Die App wird ohne Gewähr und ohne Garantie auf Verfügbarkeit betrieben. Für Datenverlust oder Ausfälle wird keine Haftung übernommen.</p>
          </section>

          <section>
            <h2 className="font-semibold text-gray-900 mb-2">Open Source</h2>
            <p>Der Quellcode von Nava ist unter der MIT-Lizenz verfügbar: <a href="https://github.com/Abuarchiv/nava" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">github.com/Abuarchiv/nava</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
