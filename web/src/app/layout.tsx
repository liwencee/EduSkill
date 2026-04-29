import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

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
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="theme-color" content="#1a7a4a" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{ duration: 4000, style: { background: '#0f1c2e', color: '#fff', borderRadius: '8px' } }}
        />
      </body>
    </html>
  )
}
