import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ── Admin principal (email traindeck = celui déjà en DB) ──────────────────
  const adminHash = await bcrypt.hash('Admin@2026!', 12)

  await prisma.user.upsert({
    where:  { email: 'admin@traindeck.com' },
    update: { password: adminHash, role: 'SUPER_ADMIN', name: 'CHRIST J.', isActive: true, mustChangePassword: false },
    create: {
      email: 'admin@traindeck.com',
      password: adminHash,
      name: 'CHRIST J.',
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: false,
    },
  })

  // ── Alias legacy (decktrain) ──────────────────────────────────────────────
  await prisma.user.upsert({
    where:  { email: 'admin@decktrain.com' },
    update: { role: 'SUPER_ADMIN', name: 'CHRIST J.', isActive: true },
    create: {
      email: 'admin@decktrain.com',
      password: adminHash,
      name: 'CHRIST J.',
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: false,
    },
  })

  // ── AppSettings ───────────────────────────────────────────────────────────
  await prisma.appSettings.upsert({
    where:  { id: 'singleton' },
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

  // ── Utilisateurs de test ──────────────────────────────────────────────────
  const formateurHash    = await bcrypt.hash('Formateur@2026!', 12)
  const participantHash  = await bcrypt.hash('Participant@2026!', 12)
  const tempAdminHash    = await bcrypt.hash('TempAdmin123!', 12)

  // Formateur de test (Scénario B)
  await prisma.appUser.upsert({
    where:  { email: 'formateur@traindeck.com' },
    update: { type: 'formateur', isActive: true, tempPassword: false, emailVerified: true },
    create: {
      email: 'formateur@traindeck.com',
      name: 'Marie Dupont',
      password: formateurHash,
      type: 'formateur',
      isActive: true,
      tempPassword: false,
      emailVerified: true,
    },
  })

  // Participant de test (Scénario C)
  await prisma.appUser.upsert({
    where:  { email: 'participant@traindeck.com' },
    update: { type: 'participant', isActive: true, tempPassword: false, emailVerified: true },
    create: {
      email: 'participant@traindeck.com',
      name: 'Jean Martin',
      password: participantHash,
      type: 'participant',
      isActive: true,
      tempPassword: false,
      emailVerified: true,
    },
  })

  // Admin temp (Scénario D — doit changer son mot de passe)
  await prisma.user.upsert({
    where:  { email: 'newadmin@traindeck.com' },
    update: { mustChangePassword: true, isActive: true },
    create: {
      email: 'newadmin@traindeck.com',
      name: 'Nouvel Admin',
      password: tempAdminHash,
      role: 'JUNIOR_ADMIN',
      isActive: true,
      mustChangePassword: true,
    },
  })

  // ── Plans tarifaires ─────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Gratuit',
      slug: 'free',
      priceFCFA: 0,
      maxModules: 3,
      maxSlides: 30,
      maxParticipants: 10,
      maxSurveys: 2,
      maxAdmins: 1,
      features: JSON.stringify(['1 formateur', '3 modules, 30 slides', '2 sondages', '10 participants', 'Export PDF', 'Support communautaire']),
      isHighlighted: false,
      isActive: true,
      sortOrder: 0,
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceFCFA: 29_000,
      maxModules: -1,
      maxSlides: -1,
      maxParticipants: 100,
      maxSurveys: -1,
      maxAdmins: 5,
      features: JSON.stringify(['Modules & slides illimités', 'Sondages illimités', '100 participants', 'Export PDF + PPTX', '5 admins + RBAC', 'Sécurité avancée', 'Support prioritaire']),
      isHighlighted: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Entreprise',
      slug: 'enterprise',
      priceFCFA: -1,
      maxModules: -1,
      maxSlides: -1,
      maxParticipants: -1,
      maxSurveys: -1,
      maxAdmins: -1,
      features: JSON.stringify(['Tout Pro inclus', 'Admins illimités', 'Participants illimités', 'Hébergement on-premise', 'SLA personnalisé', 'Formation incluse']),
      isHighlighted: false,
      isActive: true,
      sortOrder: 2,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }

  console.log('✅ Seed terminé')
  console.log('')
  console.log('Comptes créés :')
  console.log('  Admin principal  → admin@traindeck.com      / Admin@2026!')
  console.log('  Admin legacy     → admin@decktrain.com      / Admin@2026!')
  console.log('  Formateur test   → formateur@traindeck.com  / Formateur@2026!')
  console.log('  Participant test → participant@traindeck.com / Participant@2026!')
  console.log('  Admin temp (D)   → newadmin@traindeck.com   / TempAdmin123!  (doit changer le mdp)')
}

main().catch(console.error).finally(() => prisma.$disconnect())
