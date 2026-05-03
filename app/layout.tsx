import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'TrainDeck — Plateforme de formation interactive',
  description: 'Plateforme de formation interactive pour équipe IT — Mai 2026',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#12121A', border: '1px solid rgba(232,244,255,0.1)', color: '#E8F4FF' },
          }}
        />
      </body>
    </html>
  )
}
