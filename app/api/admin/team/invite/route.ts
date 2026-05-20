import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Réservé au Super Admin' }, { status: 403 })

  const { email, name, role, permissions } = await req.json()
  if (!email || !role) return NextResponse.json({ error: 'Email et rôle requis' }, { status: 400 })

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })

  const tempPassword = generatePassword()
  const hashed = await bcrypt.hash(tempPassword, 12)

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      password: hashed,
      role,
      permissions: role === 'CUSTOM_ADMIN' ? JSON.stringify(permissions ?? []) : null,
      isActive: true,
      mustChangePassword: true,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  })

  return NextResponse.json({ user, tempPassword }, { status: 201 })
}
