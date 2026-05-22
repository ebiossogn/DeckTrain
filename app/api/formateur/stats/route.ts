import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const appUser = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { moduleIds: true },
  })

  const assignedIds: string[] = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : []

  const moduleFilter = assignedIds.length ? { id: { in: assignedIds } } : {}

  const [modules, liveSessions] = await Promise.all([
    prisma.module.findMany({
      where: { ...moduleFilter, isDeleted: false },
      select: {
        id: true,
        title: true,
        createdAt: true,
        slides: { where: { isDeleted: false }, select: { type: true, timerMinutes: true } },
        exercises: { where: { isDeleted: false }, select: { id: true } },
      },
    }),
    prisma.liveSession.findMany({
      where: assignedIds.length ? { moduleId: { in: assignedIds } } : {},
      select: { id: true, moduleId: true, viewerCount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  // Totaux
  const slideCount = modules.reduce((s, m) => s + m.slides.length, 0)
  const exerciseCount = modules.reduce((s, m) => s + m.exercises.length, 0)
  const totalViewers = liveSessions.reduce((s, ls) => s + ls.viewerCount, 0)

  // Répartition des types de slides pour le donut
  const slideTypeCounts: Record<string, number> = {}
  modules.forEach((m) => {
    m.slides.forEach((s) => {
      slideTypeCounts[s.type] = (slideTypeCounts[s.type] ?? 0) + 1
    })
  })
  const slidesByType = Object.entries(slideTypeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)

  // Sessions live par mois (12 derniers mois) — bar chart
  const now = new Date()
  const sessionsByMonth: { month: string; sessions: number; viewers: number }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const inMonth = liveSessions.filter(
      (ls) => new Date(ls.createdAt) >= d && new Date(ls.createdAt) < next
    )
    sessionsByMonth.push({
      month: label,
      sessions: inMonth.length,
      viewers: inMonth.reduce((s, ls) => s + ls.viewerCount, 0),
    })
  }

  // Viewers par session (line chart — 20 dernières sessions)
  const recentSessions = [...liveSessions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 20)
    .reverse()
    .map((ls, i) => ({
      label: `S${i + 1}`,
      viewers: ls.viewerCount,
      date: new Date(ls.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    }))

  return NextResponse.json({
    moduleCount: modules.length,
    slideCount,
    exerciseCount,
    liveSessionCount: liveSessions.length,
    totalViewers,
    slidesByType,
    sessionsByMonth,
    recentSessions,
    modules: modules.map((m) => ({
      id: m.id,
      title: m.title,
      slideCount: m.slides.length,
      exerciseCount: m.exercises.length,
      estimatedMinutes: m.slides.reduce(
        (s, sl) => s + (sl.timerMinutes ?? 3),
        0
      ),
    })),
  })
}
