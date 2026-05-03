import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err

  const survey = await prisma.survey.findUnique({ where: { id: params.id }, select: { isLive: true } })
  if (!survey) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const updated = await prisma.survey.update({
    where: { id: params.id },
    data: { isLive: !survey.isLive },
    select: { id: true, isLive: true },
  })
  return NextResponse.json(updated)
}
