export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, Layers, ChevronRight, BookOpen } from 'lucide-react'

export default async function PresentPage() {
  const modules = await prisma.module.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { slides: true } } },
  })

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-14">
        {/* En-tête */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/8 text-accent text-xs font-medium mb-5">
            <Monitor size={12} />
            Mode présentation
          </div>
          <h1 className="font-syne text-4xl font-bold text-light-text dark:text-dark-text mb-2">
            Modules de formation
          </h1>
          <p className="text-light-text/55 dark:text-dark-text/55">
            Sélectionnez un module pour lancer la présentation plein écran.
          </p>
        </div>

        {/* Grille modules */}
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
              <BookOpen size={24} />
            </div>
            <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">
              Aucun module disponible
            </p>
            <p className="text-sm text-light-text/45 dark:text-dark-text/45">
              Les modules sont créés depuis l'interface d'administration.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((m) => (
              <Link key={m.id} href={`/present/${m.id}`} className="block group">
                <Card hoverable className="p-6 h-full">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                      <Layers size={20} />
                    </div>
                    <Badge variant="muted" className="text-[10px]">
                      {m._count.slides} slide{m._count.slides !== 1 ? 's' : ''}
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
                  <div className="flex items-center gap-1.5 text-accent text-xs font-medium mt-auto pt-2">
                    <Monitor size={12} />
                    Lancer
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
