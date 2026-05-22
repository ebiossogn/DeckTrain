import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mailer'
import { validateBody } from '@/lib/api-validator'
import { registerSchema } from '@/lib/validations'
import { notifyAdmins } from '@/lib/notifications'

export async function POST(req: Request) {
  const body = await req.json()
  const v = validateBody(registerSchema, body)
  if ('error' in v) return v.error
  const { name, email, password } = v.data

  // Vérifier si l'email existe déjà
  const existing = await prisma.appUser.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    // Réponse générique pour ne pas confirmer l'existence
    return NextResponse.json({ ok: true })
  }

  const hash = await bcrypt.hash(password, 12)
  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.appUser.create({
    data: {
      email: email.toLowerCase(),
      name: name.trim(),
      password: hash,
      type: 'formateur',
      isActive: false,
      emailVerified: false,
      verificationToken: token,
      verificationTokenExpiry: expiry,
    },
  })

  try {
    await sendVerificationEmail(email.toLowerCase(), name.trim(), token)
  } catch (e) {
    console.error('[register] email send failed:', e)
  }

  await notifyAdmins(
    'NEW_FORMATEUR',
    'Nouveau formateur inscrit',
    `${name.trim()} (${email.toLowerCase()}) vient de créer un compte.`,
    '/admin/users'
  ).catch(() => {})

  return NextResponse.json({ ok: true })
}
