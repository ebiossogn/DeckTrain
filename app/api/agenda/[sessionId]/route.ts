import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function PATCH(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  const { title, type, startDate, endDate, startTime, endTime, description, location, status, color, moduleId } = await req.json()
  const session = await prisma.agendaSession.update({
    where: { id: params.sessionId },
    data: {
      title: title?.trim(),
      type,
      startDate: new Date(startDate + 'T00:00:00.000Z'),
      endDate: new Date(endDate + 'T00:00:00.000Z'),
      startTime: startTime?.trim() || null,
      endTime: endTime?.trim() || null,
      description: description?.trim() || null,
      location: location?.trim() || null,
      status,
      color: color?.trim() || null,
      moduleId: moduleId || null,
    },
    include: { module: { select: { id: true, title: true } } },
  })
  return NextResponse.json({
    ...session,
    startDate: session.startDate.toISOString(),
    endDate: session.endDate.toISOString(),
    createdAt: session.createdAt.toISOString(),
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { sessionId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  await prisma.agendaSession.delete({ where: { id: params.sessionId } })
  return NextResponse.json({ ok: true })
}
