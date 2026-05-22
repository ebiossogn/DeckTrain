import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const [plans, subscriptions, planCounts] = await Promise.all([
    prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, type: true, createdAt: true } },
        plan: { select: { id: true, name: true, slug: true, priceFCFA: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscription.groupBy({
      by: ['planId'],
      _count: { planId: true },
      where: { status: 'active' },
    }),
  ])

  const totalUsers = await prisma.appUser.count()
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length

  return NextResponse.json({
    plans: plans.map(p => ({ ...p, features: JSON.parse(p.features) })),
    subscriptions: subscriptions.map(s => ({ ...s, plan: { ...s.plan } })),
    stats: {
      totalUsers,
      activeSubscriptions,
      freeUsers: totalUsers - activeSubscriptions,
      planCounts: planCounts.map(pc => ({ planId: pc.planId, count: pc._count.planId })),
    },
  })
}
