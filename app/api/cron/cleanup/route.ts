import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [modules, slides, exercises, agendaSessions, surveys] = await Promise.all([
    prisma.module.deleteMany({ where: { isDeleted: true, deletedAt: { lt: thirtyDaysAgo } } }),
    prisma.slide.deleteMany({ where: { isDeleted: true, deletedAt: { lt: thirtyDaysAgo } } }),
    prisma.exercise.deleteMany({ where: { isDeleted: true, deletedAt: { lt: thirtyDaysAgo } } }),
    prisma.agendaSession.deleteMany({ where: { isDeleted: true, deletedAt: { lt: thirtyDaysAgo } } }),
    prisma.survey.deleteMany({ where: { isDeleted: true, deletedAt: { lt: thirtyDaysAgo } } }),
  ])

  return Response.json({
    success: true,
    deleted: {
      modules: modules.count,
      slides: slides.count,
      exercises: exercises.count,
      agendaSessions: agendaSessions.count,
      surveys: surveys.count,
    },
  })
}
