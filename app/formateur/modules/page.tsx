export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { FormateurModulesClient } from '@/components/formateur/modules-client'

export default async function FormateurModulesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userId = session.user.id

  const appUser = await prisma.appUser.findUnique({
    where: { id: userId },
    select: { moduleIds: true },
  })

  const assignedIds: string[] = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : []

  const [modules, liveSessions, allParticipants] = await Promise.all([
    prisma.module.findMany({
      where: {
        isDeleted: false,
        OR: [
          { createdBy: userId },
          ...(assignedIds.length ? [{ id: { in: assignedIds } }] : []),
        ],
      },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { slides: true, exercises: true } },
        allowedParticipants: {
          include: { participant: { select: { id: true, name: true, email: true } } },
        },
      },
    }),
    prisma.liveSession.findMany({
      where: { isActive: true },
      select: { moduleId: true, code: true },
    }),
    prisma.appUser.findMany({
      where: { type: 'participant', isActive: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const liveMap = Object.fromEntries(liveSessions.map((s) => [s.moduleId, s.code]))

  return (
    <FormateurModulesClient
      userId={userId}
      modules={modules.map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        slidesCount: m._count.slides,
        exercisesCount: m._count.exercises,
        liveCode: liveMap[m.id] ?? null,
        visibility: m.visibility as 'public' | 'private' | 'countdown',
        publishAt: m.publishAt?.toISOString() ?? null,
        countdownMessage: m.countdownMessage ?? null,
        createdBy: m.createdBy ?? null,
        allowedParticipants: m.allowedParticipants.map((ap) => ap.participant),
      }))}
      allParticipants={allParticipants}
    />
  )
}
