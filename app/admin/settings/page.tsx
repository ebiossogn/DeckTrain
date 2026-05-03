import { prisma } from '@/lib/prisma'
import { SettingsClient } from '@/components/admin/settings/settings-client'

export default async function SettingsPage() {
  let settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await prisma.appSettings.create({ data: { id: 'singleton' } })
  }

  return <SettingsClient initial={settings} />
}
