import { NextResponse } from 'next/server'
import { assertAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

type Params = { params: { userId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const err = await assertAuth()
  if (err) return err

  const { name, type, isActive, moduleIds } = await req.json()

  const updated = await prisma.appUser.update({
    where: { id: params.userId },
    data: {
      ...(name !== undefined && { name }),
      ...(type !== undefined && { type }),
      ...(isActive !== undefined && { isActive }),
      ...(moduleIds !== undefined && { moduleIds: JSON.stringify(moduleIds) }),
    },
    select: { id: true, email: true, name: true, type: true, isActive: true, moduleIds: true, createdAt: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: Params) {
  const err = await assertAuth()
  if (err) return err

  await prisma.appUser.delete({ where: { id: params.userId } })
  return NextResponse.json({ ok: true })
}
