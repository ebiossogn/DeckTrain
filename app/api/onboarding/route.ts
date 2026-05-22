import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { step, complete } = await req.json()

  await prisma.appUser.update({
    where: { id: session.user.id },
    data: {
      onboardingStep: typeof step === 'number' ? step : undefined,
      firstLogin: complete === true ? false : undefined,
    },
  })

  return NextResponse.json({ ok: true })
}
