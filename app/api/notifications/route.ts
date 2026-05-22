import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/* GET — notifications non lues de l'utilisateur connecté */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json([], { status: 200 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json(
    notifications.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() }))
  )
}

/* POST — marquer comme lue ou tout marquer */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { action, id } = await req.json()

  if (action === 'read_one' && id) {
    await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    })
  } else if (action === 'read_all') {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ ok: true })
}
