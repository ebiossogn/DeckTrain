import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { auditLog } from '@/lib/audit'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const body = await req.json()
  const { title, description, visibility, publishAt, countdownMessage } = body
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const module = await prisma.module.update({
    where: { id: params.id },
    data: {
      title: title.trim(),
      description: description ?? null,
      visibility: visibility ?? 'private',
      publishAt: publishAt ? new Date(publishAt) : null,
      countdownMessage: countdownMessage ?? null,
    },
    include: { _count: { select: { slides: true } } },
  })
  await auditLog('UPDATE', 'MODULE', module.id, { title: module.title })
  return NextResponse.json({ ...module, createdAt: module.createdAt.toISOString() })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const module = await prisma.module.findUnique({ where: { id: params.id }, select: { title: true } })
  await prisma.module.update({
    where: { id: params.id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
  await auditLog('DELETE', 'MODULE', params.id, { title: module?.title, softDelete: true })
  return NextResponse.json({ ok: true })
}
