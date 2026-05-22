import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { generateSurveyCode } from '@/lib/survey-utils'
import { validateBody } from '@/lib/api-validator'
import { createSurveySchema } from '@/lib/validations'

export async function GET() {
  const err = await assertAuth()
  if (err) return err

  const surveys = await prisma.survey.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    include: {
      questions: { orderBy: { order: 'asc' } },
      _count: { select: { questions: true } },
    },
  })

  return NextResponse.json(surveys.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    questions: s.questions.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
  })))
}

export async function POST(req: Request) {
  const err = await assertAuth()
  if (err) return err

  const body = await req.json()
  const v = validateBody(createSurveySchema, body)
  if ('error' in v) return v.error
  const { title, description, questions } = v.data

  /* Génère un code unique */
  let code = generateSurveyCode()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.survey.findUnique({ where: { code } })
    if (!existing) break
    code = generateSurveyCode()
    attempts++
  }

  const survey = await prisma.survey.create({
    data: {
      title,
      description: description ?? null,
      code,
      questions: {
        create: questions.map((q, i) => ({
          type: q.type,
          order: i,
          title: q.title,
          options: q.options ?? null,
          multiple: q.multiple ?? false,
        })),
      },
    },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json({
    ...survey,
    createdAt: survey.createdAt.toISOString(),
    questions: survey.questions.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
  }, { status: 201 })
}
