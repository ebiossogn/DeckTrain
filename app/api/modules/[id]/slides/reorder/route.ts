import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function PUT(req: Request) {
  const err = await assertAuth()
  if (err) return err
  const { ids } = await req.json() as { ids: string[] }
  await Promise.all(ids.map((id, order) => prisma.slide.update({ where: { id }, data: { order } })))
  return NextResponse.json({ ok: true })
}
