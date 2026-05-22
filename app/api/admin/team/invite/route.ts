import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validateBody } from '@/lib/api-validator'
import { inviteAdminSchema } from '@/lib/validations'
import { auditLog } from '@/lib/audit'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Réservé au Super Admin' }, { status: 403 })

  const body = await req.json()
  const v = validateBody(inviteAdminSchema, body)
  if ('error' in v) return v.error
  const { email, name, role, permissions } = v.data

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

  await auditLog('INVITE_ADMIN', 'ADMIN', user.id, { email, role })
  return NextResponse.json({ user, tempPassword }, { status: 201 })
}
