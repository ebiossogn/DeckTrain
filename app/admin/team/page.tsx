import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TeamClient } from '@/components/admin/team/team-client'
import type { AdminRole } from '@/types/roles'

export default async function TeamPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (!['SUPER_ADMIN', 'SENIOR_ADMIN'].includes(session.user.role)) redirect('/admin/overview')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, name: true, role: true, permissions: true, isBlocked: true, isActive: true, lastLoginAt: true, createdAt: true },
  })

  const serialized = users.map((u) => ({
    ...u,
    role: u.role as AdminRole,
    lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
    createdAt: u.createdAt.toISOString(),
  }))

  return <TeamClient initial={serialized} currentUserId={session.user.id} />
}
