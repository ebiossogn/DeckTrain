import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/* GET public — vérification d'un certificat par code */
export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const cert = await prisma.certificate.findUnique({
    where: { code: params.code.toUpperCase() },
    include: {
      participant: { select: { name: true } },
      module:      { select: { title: true } },
    },
  })

  if (!cert) {
    return NextResponse.json({ valid: false }, { status: 404 })
  }

  return NextResponse.json({
    valid: true,
    code:            cert.code,
    participantName: cert.participant.name,
    moduleTitle:     cert.module.title,
    issuedBy:        cert.issuedBy,
    issuedAt:        cert.issuedAt.toISOString(),
  })
}
