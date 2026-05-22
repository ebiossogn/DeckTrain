import { prisma } from '@/lib/prisma'
import { ExercisesClient } from '@/components/admin/exercises/exercises-client'
import type { ModuleWithCount } from '@/types/slides'

export default async function ExercisesPage() {
  const raw = await prisma.module.findMany({
    where: { isDeleted: false },
    orderBy: { order: 'asc' },
    include: { _count: { select: { slides: true } } },
  })
  const modules: ModuleWithCount[] = raw.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    publishAt: m.publishAt?.toISOString() ?? null,
  }))
  return <ExercisesClient initialModules={modules} />
}
