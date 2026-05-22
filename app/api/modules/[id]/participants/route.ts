import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

async function authorize(moduleId: string, session: Session | null) {
  if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  const module = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!module) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 })
  const isOwner = module.createdBy === session.user.id
  const isAdmin = session.user.userType === 'admin'
  if (!isOwner && !isAdmin) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  return null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const err = await authorize(params.id, session)
  if (err) return err

  const rows = await prisma.moduleParticipant.findMany({
    where: { moduleId: params.id },
    include: { participant: { select: { id: true, name: true, email: true } } },
    orderBy: { assignedAt: 'asc' },
  })
  return NextResponse.json(rows.map(r => ({ ...r.participant, assignedAt: r.assignedAt })))
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const err = await authorize(params.id, session)
  if (err) return err

  const { participantId } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'participantId requis' }, { status: 400 })

  const participant = await prisma.appUser.findUnique({ where: { id: participantId } })
  if (!participant) return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 })

  await prisma.moduleParticipant.upsert({
    where: { moduleId_participantId: { moduleId: params.id, participantId } },
    update: {},
    create: { moduleId: params.id, participantId },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const err = await authorize(params.id, session)
  if (err) return err

  const { participantId } = await req.json()
  if (!participantId) return NextResponse.json({ error: 'participantId requis' }, { status: 400 })

  await prisma.moduleParticipant.deleteMany({
    where: { moduleId: params.id, participantId },
  })
  return NextResponse.json({ ok: true })
}
