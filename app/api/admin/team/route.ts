import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function assertSuperAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Accès réservé au Super Admin' }, { status: 403 })
  return null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (!['SUPER_ADMIN', 'SENIOR_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Accès insuffisant' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, role: true, permissions: true, isBlocked: true, isActive: true, lastLoginAt: true, createdAt: true },
  })
  return NextResponse.json(users)
}
