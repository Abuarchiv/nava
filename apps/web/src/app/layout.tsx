import type { Metadata, Viewport } from 'next'
import { QueryProvider } from '@/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Nava — Deine WG-App',
  description:
    'Ausgaben teilen, Putzplan managen, Einkaufsliste — alles für deine WG. Kostenlos. Kein Bullshit.',
  keywords: ['WG', 'Wohngemeinschaft', 'Ausgaben teilen', 'Putzplan', 'WG App', 'kostenlos'],
  authors: [{ name: 'Nava' }],
  openGraph: {
    title: 'Nava — Deine WG-App',
    description: 'Die WG-App die WG-Gesucht nicht bauen wollte. Kostenlos, open source.',
    type: 'website',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nava — Deine WG-App',
    description: 'Die WG-App die WG-Gesucht nicht bauen wollte.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1f1b16',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
