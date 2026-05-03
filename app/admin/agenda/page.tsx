import { prisma } from '@/lib/prisma'
import { AgendaClient } from '@/components/admin/agenda/agenda-client'
import type { AgendaEvent } from '@/components/admin/agenda/agenda-client'
import type { ModuleWithCount } from '@/types/slides'

export default async function AgendaAdminPage() {
  const [rawEvents, rawModules] = await Promise.all([
    prisma.agendaSession.findMany({
      orderBy: { startDate: 'asc' },
      include: { module: { select: { id: true, title: true } } },
    }),
    prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true } } },
    }),
  ])

  const events = rawEvents.map((e) => ({
    ...e,
    type: e.type as AgendaEvent['type'],
    startDate: e.startDate.toISOString(),
    endDate: e.endDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
  }))
  const modules: ModuleWithCount[] = rawModules.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  return <AgendaClient initialEvents={events} modules={modules} />
}
