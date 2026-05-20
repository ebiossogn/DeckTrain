import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=token_manquant', req.url))
  }

  const user = await prisma.appUser.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=token_invalide', req.url))
  }

  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
    return NextResponse.redirect(new URL('/login?error=token_expire', req.url))
  }

  await prisma.appUser.update({
    where: { id: user.id },
    data: {
      isActive: true,
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null,
    },
  })

  return NextResponse.redirect(new URL('/login?verified=1', req.url))
}
