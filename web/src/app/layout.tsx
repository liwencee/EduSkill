import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/components/AuthProvider'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Skillora — Learn Skills. Earn Money. Build Nigeria.',
  description: 'Nigeria\'s #1 education platform. Teachers get CPD training & AI lesson planning. Youth learn practical digital, business & technical skills. Both connect to jobs.',
  keywords: 'Nigeria education, vocational training, teacher upskilling, youth employment, digital skills Nigeria, Skillora',
  openGraph: {
    title: 'Skillora',
    description: 'Learn Skills. Earn Money. Build Nigeria.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#4F46E5" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-sans bg-white text-edu-text antialiased">
        <AuthProvider>
        {children}
        <ChatWidget />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1E1B4B', color: '#fff', borderRadius: '16px', fontFamily: 'var(--font-nunito)' },
          }}
        />
        </AuthProvider>
      </body>
    </html>
  )
}
