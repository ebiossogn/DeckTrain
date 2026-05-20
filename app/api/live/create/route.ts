import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const suffix = Array.from({ length: 5 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join('')
  return `DT-${suffix}`
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateCode()
    const existing = await prisma.liveSession.findUnique({ where: { code } })
    if (!existing) return code
  }
  throw new Error('Impossible de générer un code unique')
}

// Nettoyer les sessions expirées (> 8h)
async function cleanExpired() {
  const cutoff = new Date(Date.now() - 8 * 60 * 60 * 1000)
  await prisma.liveSession.updateMany({
    where: { isActive: true, createdAt: { lt: cutoff } },
    data: { isActive: false, endedAt: new Date() },
  })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userType = session.user.userType
  if (userType !== 'admin' && userType !== 'formateur') {
    return NextResponse.json({ error: 'Réservé aux formateurs et admins' }, { status: 403 })
  }

  const { moduleId } = await req.json()
  if (!moduleId) return NextResponse.json({ error: 'moduleId requis' }, { status: 400 })

  const module = await prisma.module.findUnique({ where: { id: moduleId } })
  if (!module) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 })

  await cleanExpired()

  // Un seul live actif par formateur
  const existingHost = await prisma.liveSession.findFirst({
    where: { hostId: session.user.id, isActive: true },
  })
  if (existingHost) {
    return NextResponse.json({
      error: 'Vous avez déjà une session live active.',
      code: existingHost.code,
    }, { status: 409 })
  }

  // Un seul live actif par module
  const existingModule = await prisma.liveSession.findFirst({
    where: { moduleId, isActive: true },
  })
  if (existingModule) {
    return NextResponse.json({
      error: 'Ce module a déjà une session live active.',
      code: existingModule.code,
    }, { status: 409 })
  }

  const code = await uniqueCode()
  const live = await prisma.liveSession.create({
    data: { code, moduleId, hostId: session.user.id },
  })

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  return NextResponse.json({
    code: live.code,
    liveUrl: `${base}/live/${live.code}`,
  }, { status: 201 })
}
