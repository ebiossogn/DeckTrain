export const dynamic = 'force-dynamic'
export const revalidate = 0

import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { AgendaPublicClient } from './agenda-public-client'
import type { AgendaEvent } from './agenda-types'

export default async function AgendaPage() {
  const raw = await prisma.agendaSession.findMany({
    orderBy: { startDate: 'asc' },
    include: { module: { select: { id: true, title: true } } },
  })

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
      <main className="flex-1">
        <AgendaPublicClient events={events} />
      </main>
      <Footer />
    </div>
  )
}
