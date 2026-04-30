import type { Metadata } from 'next'
import { Poppins, Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
})

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'SkillBridge Nigeria — Learn Skills. Earn Money. Build Nigeria.',
  description: 'Nigeria\'s #1 education platform. Teachers get CPD training & AI lesson planning. Youth learn practical digital, business & technical skills. Both connect to jobs.',
  keywords: 'Nigeria education, vocational training, teacher upskilling, youth employment, digital skills Nigeria',
  openGraph: {
    title: 'SkillBridge Nigeria',
    description: 'Learn Skills. Earn Money. Build Nigeria.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${poppins.variable} ${nunito.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-white text-edu-text antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1E1B4B', color: '#fff', borderRadius: '16px', fontFamily: 'var(--font-nunito)' },
          }}
        />
      </body>
    </html>
  )
}
