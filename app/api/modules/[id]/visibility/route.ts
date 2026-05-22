import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  visibility:       z.enum(['public', 'private', 'countdown']),
  publishAt:        z.string().datetime().nullable().optional(),
  countdownMessage: z.string().max(300).nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const module = await prisma.module.findUnique({ where: { id: params.id } })
  if (!module) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 })

  const isOwner = module.createdBy === session.user.id
  const isAdmin = session.user.userType === 'admin'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const body = await req.json()
  const v = schema.safeParse(body)
  if (!v.success) return NextResponse.json({ error: v.error.flatten() }, { status: 400 })

  const { visibility, publishAt, countdownMessage } = v.data
  const updated = await prisma.module.update({
    where: { id: params.id },
    data: {
      visibility,
      publishAt: publishAt ? new Date(publishAt) : null,
      countdownMessage: countdownMessage ?? null,
    },
  })

  return NextResponse.json(updated)
}
