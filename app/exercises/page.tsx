import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PenTool, BookOpen, ChevronRight } from 'lucide-react'

export default async function ExercisesIndexPage() {
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { exercises: true } } },
  })
  const withExercises = modules.filter((m) => m._count.exercises > 0)

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-400/30 bg-violet-400/8 text-violet-400 text-xs font-medium mb-5">
            <PenTool size={12} />
            Exercices interactifs
          </div>
          <h1 className="font-syne text-4xl font-bold text-light-text dark:text-dark-text mb-2">
            Entraînez-vous
          </h1>
          <p className="text-light-text/55 dark:text-dark-text/55">
            QCM et ateliers pratiques pour valider vos acquis.
          </p>
        </div>

        {withExercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-400/10 text-violet-400 flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">
              Aucun exercice disponible
            </p>
            <p className="text-sm text-light-text/45 dark:text-dark-text/45">
              Les exercices sont créés depuis l'interface d'administration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {withExercises.map((m) => (
              <Link key={m.id} href={`/exercises/${m.id}`} className="block group">
                <Card hoverable className="p-6 h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-violet-400/10 text-violet-400 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-400/15 transition-colors">
                      <PenTool size={20} />
                    </div>
                    <Badge variant="muted" className="text-[10px]">
                      {m._count.exercises} exercice{m._count.exercises !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <h2 className="font-syne font-bold text-lg text-light-text dark:text-dark-text mb-1 group-hover:text-accent transition-colors">
                    {m.title}
                  </h2>
                  {m.description && (
                    <p className="text-sm text-light-text/50 dark:text-dark-text/50 line-clamp-2 mb-4">
                      {m.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium mt-auto pt-2">
                    <PenTool size={12} />
                    Commencer
                    <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
