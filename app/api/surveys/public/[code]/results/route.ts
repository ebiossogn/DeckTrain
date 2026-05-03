import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aggregateResponses } from '@/lib/survey-utils'
import type { QuestionType } from '@/types/surveys'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { responses: { select: { value: true, respondent: true } } },
      },
    },
  })

  if (!survey || !survey.isActive) {
    return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  }

  const respondents = new Set<string>()
  for (const q of survey.questions)
    for (const r of q.responses)
      if (r.respondent) respondents.add(r.respondent)

  return NextResponse.json({
    surveyId: survey.id,
    isLive: survey.isLive,
    totalRespondents: respondents.size,
    questions: survey.questions.map((q) => ({
      questionId: q.id,
      title: q.title,
      type: q.type as QuestionType,
      result: aggregateResponses(q.type as QuestionType, q.options, q.responses.map((r) => r.value)),
    })),
  })
}
