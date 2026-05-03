import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function GET() {
  const settings = await prisma.appSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    const created = await prisma.appSettings.create({ data: { id: 'singleton' } })
    return NextResponse.json(created)
  }
  return NextResponse.json(settings)
}

export async function PATCH(req: Request) {
  const err = await assertAuth()
  if (err) return err

  const { solutionsVisible, accentColor, trainingTitle, trainingSubtitle, trainerName } = await req.json()

  const settings = await prisma.appSettings.upsert({
    where: { id: 'singleton' },
    update: {
      ...(solutionsVisible !== undefined && { solutionsVisible }),
      ...(accentColor !== undefined && { accentColor }),
      ...(trainingTitle !== undefined && { trainingTitle }),
      ...(trainingSubtitle !== undefined && { trainingSubtitle }),
      ...(trainerName !== undefined && { trainerName }),
    },
    create: { id: 'singleton' },
  })

  return NextResponse.json(settings)
}
