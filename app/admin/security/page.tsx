import { prisma } from '@/lib/prisma'
import { SecurityClient } from '@/components/admin/security/security-client'

export default async function SecurityPage() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const since15m = new Date(Date.now() - 15 * 60 * 1000)

  const [logs, failedLast24h, failedLast15m, blockedUsers, totalLogs] = await Promise.all([
    prisma.loginLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.loginLog.count({ where: { success: false, createdAt: { gte: since24h } } }),
    prisma.loginLog.count({ where: { success: false, createdAt: { gte: since15m } } }),
    prisma.user.findMany({ where: { isBlocked: true }, select: { id: true, email: true, createdAt: true } }),
    prisma.loginLog.count(),
  ])

  return (
    <SecurityClient
      initial={{
        logs: logs.map((l) => ({ ...l, createdAt: l.createdAt.toISOString() })),
        stats: { totalLogs, failedLast24h, failedLast15m, blockedCount: blockedUsers.length },
        blockedUsers: blockedUsers.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
      }}
    />
  )
}
