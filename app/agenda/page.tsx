export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AgendaPublicClient } from './agenda-public-client'
import type { AgendaEvent } from './agenda-types'
import Link from 'next/link'
import { Calendar, UserPlus } from 'lucide-react'

export default async function AgendaPage() {
  const [session, raw] = await Promise.all([
    getServerSession(authOptions),
    prisma.agendaSession.findMany({
      orderBy: { startDate: 'asc' },
      include: { module: { select: { id: true, title: true } } },
    }),
  ])

  const events: AgendaEvent[] = raw.map((e) => ({
    ...e,
    type: e.type as AgendaEvent['type'],
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Navbar />

      {/* Bannière CTA visiteur */}
      {!session && (
        <div className="bg-accent/5 border-b border-accent/15 px-6 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-light-text dark:text-dark-text">
              <Calendar size={14} className="text-accent" />
              <span>
                Consultez nos prochaines formations, examens et événements.{' '}
                <span className="text-light-text-muted dark:text-text-secondary">Créez un compte pour y participer !</span>
              </span>
            </div>
            <Link
              href="/register"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-accent text-[#111] text-xs font-semibold hover:bg-accent/90 transition-colors"
            >
              <UserPlus size={12} />
              S'inscrire
            </Link>
          </div>
        </div>
      )}

      <main className="flex-1">
        <AgendaPublicClient events={events} />
      </main>

      <Footer />
      <p className="text-center py-3 text-xs text-light-text/30 dark:text-dark-text/30">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
