import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  const { title, description } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const module = await prisma.module.update({
    where: { id: params.id },
    data: { title: title.trim(), description: description ?? null },
    include: { _count: { select: { slides: true } } },
  })
  return NextResponse.json({ ...module, createdAt: module.createdAt.toISOString() })
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err
  await prisma.slide.deleteMany({ where: { moduleId: params.id } })
  await prisma.module.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
