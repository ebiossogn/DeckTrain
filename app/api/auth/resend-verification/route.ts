import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/mailer'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email } = body as { email?: string }

  if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const user = await prisma.appUser.findUnique({ where: { email: email.toLowerCase() } })

  // Toujours retourner ok pour ne pas révéler si le compte existe
  if (!user || user.isActive) return NextResponse.json({ ok: true })

  const token = crypto.randomBytes(32).toString('hex')
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await prisma.appUser.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationTokenExpiry: expiry },
  })

  try {
    await sendVerificationEmail(email.toLowerCase(), user.name, token)
  } catch (e) {
    console.error('[resend-verification] email send failed:', e)
  }

  return NextResponse.json({ ok: true })
}
