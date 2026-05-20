import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormateurModulesClient } from '@/components/formateur/modules-client'

export default async function FormateurModulesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const appUser = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { moduleIds: true },
  })

  const assignedIds: string[] | null = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : null

  const [modules, liveSessions] = await Promise.all([
    prisma.module.findMany({
      where: assignedIds?.length ? { id: { in: assignedIds } } : undefined,
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true, exercises: true } } },
    }),
    prisma.liveSession.findMany({
      where: { isActive: true },
      select: { moduleId: true, code: true },
    }),
  ])

  const liveMap = Object.fromEntries(liveSessions.map((s) => [s.moduleId, s.code]))

  return (
    <FormateurModulesClient
      modules={modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        slidesCount: m._count.slides,
        exercisesCount: m._count.exercises,
        liveCode: liveMap[m.id] ?? null,
      }))}
    />
  )
}
