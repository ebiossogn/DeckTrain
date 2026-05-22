import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { auditLog } from '@/lib/audit'

/* GET — liste des certificats émis */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const certs = await prisma.certificate.findMany({
    include: {
      participant: { select: { id: true, name: true, email: true } },
      module:      { select: { id: true, title: true } },
    },
    orderBy: { issuedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json(
    certs.map((c) => ({ ...c, issuedAt: c.issuedAt.toISOString() }))
  )
}

/* POST — émettre un certificat */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { participantId, moduleId } = await req.json()
  if (!participantId || !moduleId) {
    return NextResponse.json({ error: 'participantId et moduleId requis' }, { status: 400 })
  }

  const [participant, module] = await Promise.all([
    prisma.appUser.findUnique({ where: { id: participantId }, select: { id: true, name: true, email: true } }),
    prisma.module.findUnique({ where: { id: moduleId, isDeleted: false }, select: { id: true, title: true } }),
  ])

  if (!participant) return NextResponse.json({ error: 'Participant introuvable' }, { status: 404 })
  if (!module)      return NextResponse.json({ error: 'Module introuvable' }, { status: 404 })

  // Vérifier doublon
  const existing = await prisma.certificate.findFirst({
    where: { participantId, moduleId },
  })
  if (existing) {
    return NextResponse.json({ error: 'Un certificat existe déjà pour ce participant et ce module', code: existing.code }, { status: 409 })
  }

  const code = crypto.randomBytes(6).toString('hex').toUpperCase()
  const issuedBy = session.user.name ?? session.user.email ?? 'DeckTrain'

  const cert = await prisma.certificate.create({
    data: { participantId, moduleId, issuedBy, code },
  })

  await auditLog('CREATE', 'USER', participantId, { action: 'certificate_issued', module: module.title, code })

  return NextResponse.json({
    ok: true,
    certificate: {
      id:           cert.id,
      code:         cert.code,
      issuedAt:     cert.issuedAt.toISOString(),
      issuedBy:     cert.issuedBy,
      participant:  { name: participant.name, email: participant.email },
      module:       { title: module.title },
    },
  })
}
