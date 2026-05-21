import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = schema.parse(body)

    const adminUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    return NextResponse.json({ isAdmin: !!adminUser })
  } catch {
    return NextResponse.json({ isAdmin: false })
  }
}
