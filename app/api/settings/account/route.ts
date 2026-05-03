import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { currentPassword, newEmail, newPassword } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })

  const data: { email?: string; password?: string } = {}
  if (newEmail && newEmail !== user.email) data.email = newEmail
  if (newPassword) data.password = await bcrypt.hash(newPassword, 12)

  if (!Object.keys(data).length) {
    return NextResponse.json({ message: 'Aucun changement détecté' })
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ email: updated.email })
}
