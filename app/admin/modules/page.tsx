import { prisma } from '@/lib/prisma'
import { ModulesClient } from '@/components/admin/modules/modules-client'
import type { ModuleWithCount } from '@/types/slides'

export default async function ModulesPage() {
  const [raw, liveSessions] = await Promise.all([
    prisma.module.findMany({
      where: { isDeleted: false },
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true } } },
    }),
    prisma.liveSession.findMany({
      where: { isActive: true },
      select: { moduleId: true, code: true },
    }),
  ])

  const liveMap = Object.fromEntries(liveSessions.map((s) => [s.moduleId, s.code]))

  const modules: ModuleWithCount[] = raw.map((m) => ({
    ...m,
    description: m.description ?? null,
    createdAt: m.createdAt.toISOString(),
    visibility: m.visibility,
    publishAt: m.publishAt?.toISOString() ?? null,
    countdownMessage: m.countdownMessage ?? null,
    createdBy: m.createdBy ?? null,
  }))

  return <ModulesClient initialModules={modules} liveMap={liveMap} />
}
