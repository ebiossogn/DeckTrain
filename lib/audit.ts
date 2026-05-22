import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { headers } from 'next/headers'

export type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE'
  | 'RESTORE' | 'LOGIN' | 'LOGOUT'
  | 'EXPORT' | 'IMPORT' | 'GENERATE_AI'
  | 'PASSWORD_RESET' | 'INVITE_ADMIN'

export type AuditResource =
  | 'MODULE' | 'SLIDE' | 'EXERCISE'
  | 'AGENDA' | 'SURVEY' | 'USER'
  | 'ADMIN' | 'SETTINGS' | 'SESSION_LIVE'

export async function auditLog(
  action: AuditAction,
  resource: AuditResource,
  resourceId?: string,
  details?: Record<string, unknown>
) {
  try {
    const session = await getServerSession(authOptions)
    const headersList = headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    await prisma.auditLog.create({
      data: {
        userId: session?.user?.id ?? null,
        userEmail: session?.user?.email ?? null,
        userRole: session?.user?.role ?? null,
        action,
        resource,
        resourceId: resourceId ?? null,
        details: details ? JSON.stringify(details) : null,
        ip: ip.split(',')[0].trim(),
        userAgent: userAgent.substring(0, 200),
      },
    })
  } catch (err) {
    console.error('[audit] log error:', err)
  }
}
