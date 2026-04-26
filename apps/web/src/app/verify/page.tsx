import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">N</span>
          </div>
          <span className="font-bold text-xl text-gray-900">nava</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-indigo-600" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">Check deine E-Mails</h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Wir haben dir einen Link geschickt. Klick ihn an und du bist drin.
          </p>

          <p className="text-xs text-gray-400 mt-4">
            Kein Mail bekommen? Schau im Spam-Ordner oder{' '}
            <Link href="/login" className="text-indigo-600 hover:underline">
              versuch es nochmal
            </Link>
            .
          </p>
        </div>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zum Login
        </Link>
      </div>
    </div>
  )
}
