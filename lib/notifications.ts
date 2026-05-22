import { prisma } from './prisma'

export type NotificationType =
  | 'NEW_FORMATEUR'
  | 'MODULE_CREATED'
  | 'SURVEY_RESPONSES'
  | 'LIVE_SESSION_STARTED'
  | 'EXPORT_READY'
  | 'SYSTEM_ALERT'

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  await prisma.notification.create({
    data: { userId, type, title, message, link: link ?? null },
  })
}

export async function notifyAdmins(
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  const admins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN', isActive: true },
    select: { id: true },
  })
  await Promise.all(
    admins.map((admin) => createNotification(admin.id, type, title, message, link))
  )
}
