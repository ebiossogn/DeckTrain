import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function GET() {
  const err = await assertAuth()
  if (err) return err
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { slides: true } } },
  })
  return NextResponse.json(modules.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })))
}

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err
  const { title, description } = await req.json()
  if (!title?.trim()) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
  const max = await prisma.module.aggregate({ _max: { order: true } })
  const module = await prisma.module.create({
    data: { title: title.trim(), description: description ?? null, order: (max._max.order ?? 0) + 1 },
    include: { _count: { select: { slides: true } } },
  })
  return NextResponse.json({ ...module, createdAt: module.createdAt.toISOString() }, { status: 201 })
}
