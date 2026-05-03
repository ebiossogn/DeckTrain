import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { userId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Réservé au Super Admin' }, { status: 403 })

  const { role, permissions, isActive, name } = await req.json()

  const target = await prisma.user.findUnique({ where: { id: params.userId } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  /* Empêche de modifier le seul SUPER_ADMIN */
  if (target.role === 'SUPER_ADMIN' && role && role !== 'SUPER_ADMIN') {
    const superCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN', isActive: true } })
    if (superCount <= 1) return NextResponse.json({ error: 'Impossible de rétrograder le seul Super Admin actif' }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: params.userId },
    data: {
      ...(role !== undefined && { role }),
      ...(permissions !== undefined && { permissions: JSON.stringify(permissions) }),
      ...(isActive !== undefined && { isActive }),
      ...(name !== undefined && { name }),
    },
    select: { id: true, email: true, name: true, role: true, permissions: true, isBlocked: true, isActive: true, lastLoginAt: true, createdAt: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (session.user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Réservé au Super Admin' }, { status: 403 })
  if (session.user.id === params.userId) return NextResponse.json({ error: 'Impossible de vous supprimer vous-même' }, { status: 400 })

  const target = await prisma.user.findUnique({ where: { id: params.userId } })
  if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })

  if (target.role === 'SUPER_ADMIN') {
    const count = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } })
    if (count <= 1) return NextResponse.json({ error: 'Impossible de supprimer le seul Super Admin' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: params.userId } })
  return NextResponse.json({ ok: true })
}
