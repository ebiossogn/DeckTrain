import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { ExercisesPageClient } from './exercises-client'
import { PenTool, ArrowLeft } from 'lucide-react'
import type { ExerciseWithContent } from '@/types/exercises'

export default async function ExercisesModulePage({
  params,
}: {
  params: { moduleId: string }
}) {
  const [module, settings] = await Promise.all([
    prisma.module.findUnique({
      where: { id: params.moduleId },
      include: { exercises: { orderBy: { order: 'asc' } } },
    }),
    prisma.appSettings.findUnique({ where: { id: 'singleton' } }),
  ])

  if (!module) notFound()

  const exercises: ExerciseWithContent[] = module.exercises.map((e) => ({
    id: e.id,
    moduleId: e.moduleId,
    type: e.type as ExerciseWithContent['type'],
    title: e.title,
    content: JSON.parse(e.content) as ExerciseWithContent['content'],
    difficulty: e.difficulty as ExerciseWithContent['difficulty'],
    solution: e.solution,
    order: e.order,
    createdAt: e.createdAt.toISOString(),
  }))

  const qcmCount = exercises.filter((e) => e.type === 'qcm').length
  const atelierCount = exercises.filter((e) => e.type === 'atelier').length

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-14">
        {/* Retour */}
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-sm text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Tous les exercices
        </Link>

        {/* En-tête module */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-400/30 bg-violet-400/8 text-violet-400 text-xs font-medium mb-4">
            <PenTool size={12} />
            {exercises.length} exercice{exercises.length !== 1 ? 's' : ''}
          </div>
          <h1 className="font-syne text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            {module.title}
          </h1>
          {module.description && (
            <p className="text-light-text/55 dark:text-dark-text/55">{module.description}</p>
          )}
          <div className="flex gap-2 mt-4">
            {qcmCount > 0 && (
              <Badge className="text-violet-400 bg-violet-400/10 border-violet-400/25 text-[10px]">
                {qcmCount} QCM
              </Badge>
            )}
            {atelierCount > 0 && (
              <Badge className="text-blue-400 bg-blue-400/10 border-blue-400/25 text-[10px]">
                {atelierCount} Atelier{atelierCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="text-center py-16 text-light-text/40 dark:text-dark-text/40">
            <PenTool size={28} className="mx-auto mb-3 opacity-40" />
            <p>Aucun exercice pour ce module.</p>
          </div>
        ) : (
          <ExercisesPageClient
            exercises={exercises}
            defaultSolutionVisible={settings?.solutionsVisible ?? false}
          />
        )}
      </main>

      <Footer />
    </div>
  )
}
