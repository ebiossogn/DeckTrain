import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validateBody } from '@/lib/api-validator'
import { changePasswordSchema } from '@/lib/validations'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const v = validateBody(changePasswordSchema, body)
  if ('error' in v) return v.error
  const { password } = v.data

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
