import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password, _honey } = body as {
    name: string
    email: string
    password: string
    _honey: string
  }

  // Honeypot: les bots remplissent ce champ caché
  if (_honey) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  // Validations basiques
  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères' }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
  }

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
    // On ne bloque pas l'inscription si l'email échoue en dev
  }

  return NextResponse.json({ ok: true })
}
