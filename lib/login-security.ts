import { prisma } from '@/lib/prisma'

const RATE_LIMIT_WINDOW_MS  = 15 * 60 * 1000  // 15 min
const RATE_LIMIT_MAX        = 5                 // tentatives par IP
const BLOCK_THRESHOLD       = 10               // échecs consécutifs → blocage

/** Extrait l'IP depuis les headers de la requête */
export function extractIp(req: Request | { headers: Record<string, string | string[] | undefined> }): string {
  const headers = req instanceof Request ? Object.fromEntries(req.headers.entries()) : req.headers
  const forwarded = headers['x-forwarded-for']
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded
    return first.split(',')[0].trim()
  }
  return headers['x-real-ip'] as string || '127.0.0.1'
}

/** Vérifie si l'IP est en rate-limit (trop de tentatives échouées) */
export async function isIpRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS)
  const count = await prisma.loginLog.count({
    where: { ip, success: false, createdAt: { gte: since } },
  })
  return count >= RATE_LIMIT_MAX
}

/** Vérifie si le compte est bloqué */
export async function isAccountBlocked(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { email }, select: { isBlocked: true } })
  return user?.isBlocked ?? false
}

/** Enregistre une tentative de connexion */
export async function logLoginAttempt(
  email: string,
  ip: string,
  success: boolean,
  userAgent?: string,
): Promise<void> {
  await prisma.loginLog.create({ data: { email, ip, success, userAgent: userAgent ?? null } })
}

/** Après un échec, compte les échecs consécutifs et bloque si nécessaire */
export async function checkAndBlockAfterFailure(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } })
  if (!user) return

  // Récupère les derniers logs de ce compte, dans l'ordre chronologique inverse
  const recent = await prisma.loginLog.findMany({
    where: { email },
    orderBy: { createdAt: 'desc' },
    take: BLOCK_THRESHOLD,
    select: { success: true },
  })

  // Compte les échecs consécutifs depuis le dernier succès
  let consecutive = 0
  for (const log of recent) {
    if (!log.success) consecutive++
    else break
  }

  if (consecutive >= BLOCK_THRESHOLD) {
    await prisma.user.update({ where: { id: user.id }, data: { isBlocked: true } })
  }
}

/** Débloque un compte */
export async function unblockAccount(userId: string): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: false } })
  // Purge les logs d'échec pour repartir à zéro
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  if (user) {
    await prisma.loginLog.deleteMany({ where: { email: user.email, success: false } })
  }
}
