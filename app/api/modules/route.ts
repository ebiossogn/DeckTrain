import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { validateBody } from '@/lib/api-validator'
import { createModuleSchema } from '@/lib/validations'

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
  const body = await req.json()
  const v = validateBody(createModuleSchema, body)
  if ('error' in v) return v.error
  const { title, description } = v.data
  const max = await prisma.module.aggregate({ _max: { order: true } })
  const module = await prisma.module.create({
    data: { title, description: description ?? null, order: (max._max.order ?? 0) + 1 },
    include: { _count: { select: { slides: true } } },
  })
  return NextResponse.json({ ...module, createdAt: module.createdAt.toISOString() }, { status: 201 })
}
