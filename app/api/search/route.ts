import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ results: [] })
  }

  const [modules, exercises, surveys] = await Promise.all([
    prisma.module.findMany({
      where: {
        isDeleted: false,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 5,
      select: { id: true, title: true, description: true },
    }),

    prisma.exercise.findMany({
      where: {
        isDeleted: false,
        title: { contains: query },
      },
      take: 5,
      include: { module: { select: { title: true } } },
    }),

    prisma.survey.findMany({
      where: {
        isDeleted: false,
        title: { contains: query },
      },
      take: 3,
      select: { id: true, title: true },
    }),
  ])

  const results = [
    ...modules.map((m) => ({
      type: 'module',
      id: m.id,
      title: m.title,
      subtitle: m.description ?? 'Module',
      icon: 'module',
      link: `/admin/modules/${m.id}`,
    })),
    ...exercises.map((e) => ({
      type: 'exercise',
      id: e.id,
      title: e.title,
      subtitle: `Exercice · ${e.module.title}`,
      icon: 'exercise',
      link: `/admin/exercises`,
    })),
    ...surveys.map((s) => ({
      type: 'survey',
      id: s.id,
      title: s.title,
      subtitle: 'Sondage',
      icon: 'survey',
      link: `/admin/surveys`,
    })),
  ]

  return NextResponse.json({ results })
}
