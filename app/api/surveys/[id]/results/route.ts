import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'
import { aggregateResponses } from '@/lib/survey-utils'
import type { QuestionType } from '@/types/surveys'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const err = await assertAuth()
  if (err) return err

  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { responses: { select: { value: true, respondent: true } } },
      },
    },
  })
  if (!survey) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  const respondents = new Set<string>()
  for (const q of survey.questions)
    for (const r of q.responses)
      if (r.respondent) respondents.add(r.respondent)

  return NextResponse.json({
    surveyId: survey.id,
    totalRespondents: respondents.size,
    questions: survey.questions.map((q) => ({
      questionId: q.id,
      title: q.title,
      type: q.type as QuestionType,
      result: aggregateResponses(q.type as QuestionType, q.options, q.responses.map((r) => r.value)),
    })),
  })
}
