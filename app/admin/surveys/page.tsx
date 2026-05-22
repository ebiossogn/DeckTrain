import { prisma } from '@/lib/prisma'
import { SurveysClient } from '@/components/admin/surveys/surveys-client'
import type { SurveyData } from '@/types/surveys'
import type { QuestionType } from '@/types/surveys'

export default async function SurveysPage() {
  const surveys = await prisma.survey.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  const data: SurveyData[] = surveys.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    code: s.code,
    isActive: s.isActive,
    isLive: s.isLive,
    createdAt: s.createdAt.toISOString(),
    questions: s.questions.map((q) => ({
      id: q.id,
      surveyId: q.surveyId,
      type: q.type as QuestionType,
      order: q.order,
      title: q.title,
      options: q.options,
      multiple: q.multiple,
      createdAt: q.createdAt.toISOString(),
    })),
  }))

  return <SurveysClient initial={data} />
}
