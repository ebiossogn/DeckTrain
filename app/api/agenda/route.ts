import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { validateBody } from '@/lib/api-validator'
import { createAgendaSchema } from '@/lib/validations'

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
  const body = await req.json()
  const v = validateBody(createAgendaSchema, body)
  if ('error' in v) return v.error
  const { title, type, startDate, endDate, startTime, endTime, description, location, status, color, moduleId } = v.data
  const session = await prisma.agendaSession.create({
    data: {
      title,
      type: type || 'formation',
      startDate: new Date(startDate + 'T00:00:00.000Z'),
      endDate: new Date(endDate + 'T00:00:00.000Z'),
      startTime: startTime?.trim() || null,
      endTime: endTime?.trim() || null,
      description: description?.trim() || null,
      location: location?.trim() || null,
      status: status || 'planifie',
      color: (color?.trim() || null) as string | null,
      moduleId: moduleId || null,
    },
    include: { module: { select: { id: true, title: true } } },
  })
  return NextResponse.json(
    { ...session, startDate: session.startDate.toISOString(), endDate: session.endDate.toISOString(), createdAt: session.createdAt.toISOString() },
    { status: 201 }
  )
}
