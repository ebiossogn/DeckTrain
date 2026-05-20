import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const PWD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { password } = await req.json()

  if (!password || !PWD_REGEX.test(password)) {
    return NextResponse.json({
      error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial.',
    }, { status: 400 })
  }

  const hash = await bcrypt.hash(password, 12)
  const { userType, role } = session.user

  if (userType === 'admin') {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hash, mustChangePassword: false, passwordChangedAt: new Date() },
    })
  } else {
    await prisma.appUser.update({
      where: { id: session.user.id },
      data: { password: hash, tempPassword: false },
    })
  }

  let redirectTo = '/login'
  if (userType === 'admin') redirectTo = '/admin/overview'
  else if (userType === 'formateur' || role === 'formateur') redirectTo = '/formateur'
  else if (userType === 'participant' || role === 'participant') redirectTo = '/participant'

  return NextResponse.json({ success: true, redirectTo })
}
