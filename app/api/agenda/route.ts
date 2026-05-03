import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function GET() {
  const sessions = await prisma.agendaSession.findMany({
    orderBy: { startDate: 'asc' },
    include: { module: { select: { id: true, title: true } } },
  })
  return NextResponse.json(
    sessions.map((s) => ({
      ...s,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }))
  )
}

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err
  const { title, type, startDate, endDate, startTime, endTime, description, location, status, color, moduleId } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  if (!startDate || !endDate) return NextResponse.json({ error: 'Dates requises' }, { status: 400 })
  const session = await prisma.agendaSession.create({
    data: {
      title: title.trim(),
      type: type || 'formation',
      startDate: new Date(startDate + 'T00:00:00.000Z'),
      endDate: new Date(endDate + 'T00:00:00.000Z'),
      startTime: startTime?.trim() || null,
      endTime: endTime?.trim() || null,
      description: description?.trim() || null,
      location: location?.trim() || null,
      status: status || 'planifie',
      color: color?.trim() || null,
      moduleId: moduleId || null,
    },
    include: { module: { select: { id: true, title: true } } },
  })
  return NextResponse.json(
    { ...session, startDate: session.startDate.toISOString(), endDate: session.endDate.toISOString(), createdAt: session.createdAt.toISOString() },
    { status: 201 }
  )
}
