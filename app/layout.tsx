import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/session-provider'

export const metadata: Metadata = {
  title: 'DeckTrain — La formation interactive pensée pour l\'Afrique',
  description: 'Plateforme tout-en-un : slides interactives, exercices, sondages en direct et agenda. Alternative à PowerPoint pensée pour les formateurs africains.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
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
            style: { background: '#1C1C1C', border: '1px solid rgba(46,46,46,0.9)', color: '#CCCCCC' },
          }}
        />
      </body>
    </html>
  )
}
