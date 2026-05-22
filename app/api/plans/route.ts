import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true, name: true, slug: true, priceFCFA: true,
      maxModules: true, maxSlides: true, maxParticipants: true,
      maxSurveys: true, maxAdmins: true, features: true,
      isHighlighted: true, sortOrder: true,
    },
  })

  return NextResponse.json(plans.map(p => ({
    ...p,
    features: JSON.parse(p.features),
  })))
}
