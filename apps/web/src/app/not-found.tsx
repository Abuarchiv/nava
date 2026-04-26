import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl mb-4">🏠</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Seite nicht gefunden</h1>
      <p className="text-gray-500 mb-6">
        Die Seite existiert nicht — vielleicht hat jemand die Wohnungstür verwechselt.
      </p>
      <Link href="/" className="btn-primary inline-flex">
        Zur Startseite
      </Link>
    </div>
  )
}
