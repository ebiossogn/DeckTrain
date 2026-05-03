import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UsersClient } from '@/components/admin/users/users-client'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [rawUsers, modules] = await Promise.all([
    prisma.appUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, type: true, isActive: true, moduleIds: true, createdAt: true },
    }),
    prisma.module.findMany({ orderBy: { order: 'asc' }, select: { id: true, title: true } }),
  ])

  const users = rawUsers.map((u) => ({ ...u, type: u.type as 'formateur' | 'participant', createdAt: u.createdAt.toISOString() }))

  return <UsersClient initial={users} modules={modules} />
}
