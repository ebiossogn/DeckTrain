import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function ParticipantLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')
  if (session.user.userType === 'admin') redirect('/admin/overview')
  if (session.user.userType === 'formateur') redirect('/formateur')

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-40 px-6 py-3 border-b border-light-border dark:border-dark-border bg-light-bg/90 dark:bg-dark-bg/90 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/participant" className="flex items-center gap-2 font-display font-bold text-lg">
              <Zap className="text-accent" size={16} />
              <span className="text-light-text dark:text-white">Deck</span><span className="text-or">Train</span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {[
                { href: '/participant', label: 'Formations' },
                { href: '/exercises',  label: 'Exercices' },
                { href: '/agenda',     label: 'Agenda' },
                { href: '/surveys',    label: 'Sondages' },
              ].map(({ href, label }) => (
                <Link key={href} href={href}
                  className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/5 dark:hover:bg-dark-text/5 transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-text-secondary">{session.user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">{children}</main>

      <footer className="py-4 text-center label-dt text-text-secondary border-t border-light-border dark:border-dark-border">
        © {new Date().getFullYear()} CHRIST J. — DeckTrain
      </footer>
    </div>
  )
}
