import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { validateBody } from '@/lib/api-validator'
import { updateSettingsSchema } from '@/lib/validations'

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

  const body = await req.json()
  const v = validateBody(updateSettingsSchema, body)
  if ('error' in v) return v.error
  const { solutionsVisible, accentColor, trainingTitle, trainingSubtitle, trainerName } = v.data

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
