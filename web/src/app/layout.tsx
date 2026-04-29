import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SkillBridge Nigeria — Upskill Teachers. Empower Youth. Connect to Opportunity.',
  description: 'Nigeria\'s two-sided education platform. Teachers get CPD training and AI lesson planning. Youth learn vocational and digital skills. Both connect to jobs.',
  keywords: 'Nigeria education, vocational training, teacher upskilling, youth employment, digital skills Nigeria',
  openGraph: {
    title: 'SkillBridge Nigeria',
    description: 'Upskill Nigeria\'s Teachers. Empower Nigeria\'s Youth. Connect Both to Opportunity.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${jakarta.variable} ${nunito.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#378ADD" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-brand-bg text-brand-ink antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e4f8a', color: '#fff', borderRadius: '12px' },
          }}
        />
      </body>
    </html>
  )
}
