import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Zurück
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Datenschutzerklärung</h1>
        <p className="text-sm text-gray-500 mb-8">Stand: April 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Wer wir sind</h2>
            <p>Nava ist eine kostenlose, open-source WG-App. Der Quellcode ist unter <a href="https://github.com/Abuarchiv/nava" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">github.com/Abuarchiv/nava</a> einsehbar.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Welche Daten wir speichern</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Account-Daten:</strong> E-Mail-Adresse, Anzeigename (bei Registrierung angegeben)</li>
              <li><strong>WG-Daten:</strong> WG-Name, Mitgliedschaften, Ausgaben, Putzplan-Einträge, Einkaufslisten</li>
              <li><strong>Technische Logs:</strong> Supabase speichert Standard-Authentifizierungslogs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Wo Daten gespeichert werden</h2>
            <p>Alle Daten werden auf Servern von <strong>Supabase</strong> in der Region <strong>Frankfurt, Deutschland (eu-central-1)</strong> gespeichert. Supabase ist DSGVO-konform. Keine Daten werden außerhalb der EU verarbeitet.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Keine Werbung, kein Tracking</h2>
            <p>Nava enthält keine Werbung, kein Google Analytics, keine Social-Media-Tracker, kein Fingerprinting und keine Weitergabe von Daten an Dritte.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Deine Rechte</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung (Art. 16 DSGVO)</li>
              <li>Löschung — Account kann jederzeit gelöscht werden (Art. 17 DSGVO)</li>
              <li>Datenportabilität (Art. 20 DSGVO)</li>
            </ul>
            <p className="mt-2 text-sm">Anfragen: <a href="mailto:abubakarabditube@gmail.com" className="text-indigo-600 hover:underline">abubakarabditube@gmail.com</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Cookies</h2>
            <p>Nava nutzt ausschließlich notwendige Session-Cookies für die Authentifizierung (Supabase Auth). Keine Marketing-Cookies.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
