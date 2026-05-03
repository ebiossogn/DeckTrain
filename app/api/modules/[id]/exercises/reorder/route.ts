import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err
  const { ids } = (await req.json()) as { ids: string[] }
  await Promise.all(
    ids.map((id, i) => prisma.exercise.update({ where: { id }, data: { order: i + 1 } }))
  )
  return NextResponse.json({ ok: true })
}
