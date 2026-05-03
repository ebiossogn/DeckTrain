import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Admin1234!', 12)

  await prisma.user.upsert({
    where: { email: 'admin@traindeck.com' },
    update: { role: 'SUPER_ADMIN', name: 'CHRIST J.', isActive: true },
    create: { email: 'admin@traindeck.com', password: hashedPassword, name: 'CHRIST J.', role: 'SUPER_ADMIN', isActive: true },
  })

  await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      solutionsVisible: false,
      accentColor: '#00D4FF',
      trainingTitle: 'Formation Tech',
      trainingSubtitle: 'Équipe IT — Mai 2026',
      trainerName: 'CHRIST J.',
    },
  })

  console.log('Seed terminé')
}

main().catch(console.error).finally(() => prisma.$disconnect())
