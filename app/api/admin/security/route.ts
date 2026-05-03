import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function GET() {
  const err = await assertAuth()
  if (err) return err

  const since24h  = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const since15m  = new Date(Date.now() - 15 * 60 * 1000)

  const [recentLogs, failedLast24h, failedLast15m, blockedUsers, totalLogs] = await Promise.all([
    prisma.loginLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.loginLog.count({ where: { success: false, createdAt: { gte: since24h } } }),
    prisma.loginLog.count({ where: { success: false, createdAt: { gte: since15m } } }),
    prisma.user.findMany({
      where: { isBlocked: true },
      select: { id: true, email: true, createdAt: true },
    }),
    prisma.loginLog.count(),
  ])

  return NextResponse.json({
    logs: recentLogs,
    stats: {
      totalLogs,
      failedLast24h,
      failedLast15m,
      blockedCount: blockedUsers.length,
    },
    blockedUsers,
  })
}
