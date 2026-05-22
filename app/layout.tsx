export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/session-provider'
import { AccentProvider } from '@/components/providers/accent-provider'
import { prisma } from '@/lib/prisma'
import { InstallPWABanner } from '@/components/ui/install-pwa-banner'

export const metadata: Metadata = {
  title: 'DeckTrain — La formation interactive pensée pour l\'Afrique',
  description: 'Plateforme tout-en-un : slides interactives, exercices, sondages en direct et agenda. Alternative à PowerPoint pensée pour les formateurs africains.',
  manifest: '/manifest.json',
  themeColor: '#00D4FF',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DeckTrain',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.appSettings
    .findUnique({ where: { id: 'singleton' } })
    .catch(() => null)

  const accentColor = settings?.accentColor ?? '#00D4FF'

  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            <AccentProvider accentColor={accentColor} />
            {children}
          </ThemeProvider>
        </AuthProvider>
        <InstallPWABanner />
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
