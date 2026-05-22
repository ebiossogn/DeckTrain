import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action') || undefined
  const userEmail = searchParams.get('userEmail') || undefined
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action } : {}),
      ...(userEmail ? { userEmail: { contains: userEmail } } : {}),
      ...(dateFrom || dateTo ? {
        createdAt: {
          ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
          ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
        },
      } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 500,
  })

  return NextResponse.json(
    logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() }))
  )
}
