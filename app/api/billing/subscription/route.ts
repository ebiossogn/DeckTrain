import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const user = await prisma.appUser.findUnique({
    where: { email: session.user.email },
    include: { subscription: { include: { plan: true } } },
  })

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  if (!user.subscription) {
    const freePlan = await prisma.plan.findUnique({ where: { slug: 'free' } })
    return NextResponse.json({ plan: freePlan ? { ...freePlan, features: JSON.parse(freePlan.features) } : null, status: 'free' })
  }

  return NextResponse.json({
    ...user.subscription,
    plan: { ...user.subscription.plan, features: JSON.parse(user.subscription.plan.features) },
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { planSlug } = await req.json()
  if (!planSlug) return NextResponse.json({ error: 'planSlug requis' }, { status: 400 })

  const plan = await prisma.plan.findUnique({ where: { slug: planSlug, isActive: true } })
  if (!plan) return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })

  const user = await prisma.appUser.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const sub = await prisma.subscription.upsert({
    where: { userId: user.id },
    update: { planId: plan.id, status: 'active', startedAt: new Date() },
    create: { userId: user.id, planId: plan.id, status: 'active' },
    include: { plan: true },
  })

  return NextResponse.json({ ...sub, plan: { ...sub.plan, features: JSON.parse(sub.plan.features) } })
}
