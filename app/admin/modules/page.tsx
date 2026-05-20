import { prisma } from '@/lib/prisma'
import { ModulesClient } from '@/components/admin/modules/modules-client'
import type { ModuleWithCount } from '@/types/slides'

export default async function ModulesPage() {
  const [raw, liveSessions] = await Promise.all([
    prisma.module.findMany({
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
  }))

  return <ModulesClient initialModules={modules} liveMap={liveMap} />
}
