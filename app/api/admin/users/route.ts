import { NextResponse } from 'next/server'
import { assertAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$'
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function GET() {
  const err = await assertAuth()
  if (err) return err

  const users = await prisma.appUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, type: true, isActive: true, moduleIds: true, createdAt: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err

  const { email, name, type, moduleIds } = await req.json()
  if (!email || !name || !type) return NextResponse.json({ error: 'Email, nom et type requis' }, { status: 400 })

  const existing = await prisma.appUser.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })

  const tempPassword = generatePassword()
  const hashed = await bcrypt.hash(tempPassword, 12)

  const user = await prisma.appUser.create({
    data: {
      email,
      name,
      password: hashed,
      type,
      isActive: true,
      tempPassword: true,
      emailVerified: true,
      moduleIds: moduleIds ? JSON.stringify(moduleIds) : null,
    },
    select: { id: true, email: true, name: true, type: true, isActive: true, moduleIds: true, createdAt: true },
  })

  return NextResponse.json({ user, tempPassword }, { status: 201 })
}
