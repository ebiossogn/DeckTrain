import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { SurveyRespondent } from './survey-respondent'
import type { Metadata } from 'next'

interface Props {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    select: { title: true, description: true },
  })
  if (!survey) return { title: 'Sondage introuvable — DeckTrain' }
  return {
    title: `${survey.title} — DeckTrain`,
    description: survey.description ?? 'Répondez à ce sondage.',
  }
}

export default async function SurveyRespondPage({ params }: Props) {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  if (!survey || !survey.isActive) notFound()

  const data = {
    id: survey.id,
    title: survey.title,
    description: survey.description,
    code: survey.code,
    isLive: survey.isLive,
    questions: survey.questions.map((q) => ({
      id: q.id,
      type: q.type as import('@/types/surveys').QuestionType,
      title: q.title,
      options: q.options,
      multiple: q.multiple,
    })),
  }

  return (
    <div className="min-h-screen bg-[#0C0C14] flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-white/8">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <span className="font-display font-bold text-lg"><span className="text-white">Deck</span><span className="text-or">Train</span></span>
          <span className="text-white/20 text-xs ml-auto">Sondage #{survey.code}</span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 px-5 py-8">
        <div className="max-w-lg mx-auto space-y-6">
          <div>
            <h1 className="font-syne text-2xl font-bold text-white leading-tight">{survey.title}</h1>
            {survey.description && (
              <p className="text-white/45 text-sm mt-1">{survey.description}</p>
            )}
          </div>
          <SurveyRespondent survey={data} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-white/20 text-xs border-t border-white/8">
        © CHRIST J. — DeckTrain
      </footer>
    </div>
  )
}
