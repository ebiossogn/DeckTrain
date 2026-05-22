import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { auditLog } from '@/lib/audit'

/* GET — liste tous les éléments en corbeille (< 30 jours) */
export async function GET() {
  const err = await assertAuth()
  if (err) return err

  const since = new Date()
  since.setDate(since.getDate() - 30)

  const [modules, slides, exercises, agendaSessions, surveys] = await Promise.all([
    prisma.module.findMany({
      where: { isDeleted: true, deletedAt: { gte: since } },
      select: { id: true, title: true, deletedAt: true },
    }),
    prisma.slide.findMany({
      where: { isDeleted: true, deletedAt: { gte: since } },
      select: { id: true, type: true, moduleId: true, deletedAt: true },
    }),
    prisma.exercise.findMany({
      where: { isDeleted: true, deletedAt: { gte: since } },
      select: { id: true, title: true, type: true, moduleId: true, deletedAt: true },
    }),
    prisma.agendaSession.findMany({
      where: { isDeleted: true, deletedAt: { gte: since } },
      select: { id: true, title: true, deletedAt: true },
    }),
    prisma.survey.findMany({
      where: { isDeleted: true, deletedAt: { gte: since } },
      select: { id: true, title: true, deletedAt: true },
    }),
  ])

  return NextResponse.json({ modules, slides, exercises, agendaSessions, surveys })
}

/* POST — restaurer ou supprimer définitivement */
export async function POST(req: NextRequest) {
  const err = await assertAuth()
  if (err) return err

  const { action, type, id } = await req.json()

  if (action === 'restore') {
    switch (type) {
      case 'module':
        await prisma.module.update({ where: { id }, data: { isDeleted: false, deletedAt: null } })
        await auditLog('RESTORE', 'MODULE', id)
        break
      case 'slide':
        await prisma.slide.update({ where: { id }, data: { isDeleted: false, deletedAt: null } })
        await auditLog('RESTORE', 'SLIDE', id)
        break
      case 'exercise':
        await prisma.exercise.update({ where: { id }, data: { isDeleted: false, deletedAt: null } })
        await auditLog('RESTORE', 'EXERCISE', id)
        break
      case 'agenda':
        await prisma.agendaSession.update({ where: { id }, data: { isDeleted: false, deletedAt: null } })
        await auditLog('RESTORE', 'AGENDA', id)
        break
      case 'survey':
        await prisma.survey.update({ where: { id }, data: { isDeleted: false, deletedAt: null } })
        await auditLog('RESTORE', 'SURVEY', id)
        break
    }
    return NextResponse.json({ ok: true, action: 'restored' })
  }

  if (action === 'purge') {
    switch (type) {
      case 'module':
        await prisma.module.delete({ where: { id } })
        break
      case 'slide':
        await prisma.slide.delete({ where: { id } })
        break
      case 'exercise':
        await prisma.exercise.delete({ where: { id } })
        break
      case 'agenda':
        await prisma.agendaSession.delete({ where: { id } })
        break
      case 'survey':
        await prisma.survey.delete({ where: { id } })
        break
    }
    return NextResponse.json({ ok: true, action: 'purged' })
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
}
