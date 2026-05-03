import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { generateSurveyCode } from '@/lib/survey-utils'

export async function GET() {
  const err = await assertAuth()
  if (err) return err

  const surveys = await prisma.survey.findMany({
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

  const { title, description, questions } = await req.json()
  if (!title) return NextResponse.json({ error: 'Titre requis' }, { status: 400 })

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
        create: (questions ?? []).map((q: { type: string; title: string; options?: string; multiple?: boolean }, i: number) => ({
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
