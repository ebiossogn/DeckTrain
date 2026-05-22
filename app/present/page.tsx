export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import { Monitor, Layers, ChevronRight, BookOpen, Lock, Globe, Timer } from 'lucide-react'

const VISIBILITY_BADGE = {
  public:    { label: 'Public',    icon: Globe, color: 'text-emerald-400 bg-emerald-500/10' },
  private:   { label: 'Privé',     icon: Lock,  color: 'text-light-text-muted dark:text-text-secondary bg-light-text/5 dark:bg-dark-text/5' },
  countdown: { label: 'Bientôt',   icon: Timer, color: 'text-or bg-or/10 dark:text-or dark:bg-or/10' },
}

export default async function PresentPage() {
  const session = await getServerSession(authOptions)
  const userType = session?.user?.userType
  const userId = session?.user?.id

  // Filtrage selon le rôle
  let whereClause: Record<string, unknown> = {}

  if (!session) {
    whereClause = { isDeleted: false, visibility: { in: ['public', 'countdown'] } }
  } else if (userType === 'participant') {
    whereClause = {
      isDeleted: false,
      OR: [
        { visibility: { in: ['public', 'countdown'] } },
        { visibility: 'private', allowedParticipants: { some: { participantId: userId } } },
      ],
    }
  } else if (userType === 'formateur') {
    whereClause = { isDeleted: false, createdBy: userId }
  } else {
    // admin : tout voir
    whereClause = { isDeleted: false }
  }

  const modules = await prisma.module.findMany({
    where: whereClause,
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { slides: true } },
      allowedParticipants: { select: { participantId: true } },
    },
  })

  const isFormateur = userType === 'formateur'
  const isAdmin = userType === 'admin'

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
            {!session
              ? 'Modules publics disponibles en aperçu.'
              : userType === 'participant'
              ? 'Vos modules assignés et formations publiques.'
              : userType === 'formateur'
              ? 'Vos modules — gérez la visibilité depuis votre espace.'
              : 'Vue administrateur — tous les modules.'}
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
              {!session
                ? 'Connectez-vous pour accéder à plus de contenus.'
                : 'Aucun module ne vous est assigné pour le moment.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {modules.map((m) => {
              const isOwner = m.createdBy === userId
              const canLaunch = (isFormateur && isOwner) || isAdmin
              const vis = VISIBILITY_BADGE[m.visibility as keyof typeof VISIBILITY_BADGE] ?? VISIBILITY_BADGE.private
              const VisIcon = vis.icon

              return (
                <div key={m.id} className="flex flex-col gap-3">
                  <Card hoverable={canLaunch} className="p-6 h-full">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                        <Layers size={20} />
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Badge visibilité */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${vis.color}`}>
                          <VisIcon size={9} />
                          {vis.label}
                        </span>
                        <Badge variant="muted" className="text-[10px]">
                          {m._count.slides} slide{m._count.slides !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>

                    <h2 className="font-syne font-bold text-lg text-light-text dark:text-dark-text mb-1">
                      {m.title}
                    </h2>
                    {m.description && (
                      <p className="text-sm text-light-text/50 dark:text-dark-text/50 line-clamp-2 mb-4">
                        {m.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pt-2 mt-auto">
                      {canLaunch ? (
                        <Link
                          href={`/present/${m.id}`}
                          className="flex items-center gap-1.5 text-accent text-xs font-medium hover:underline"
                        >
                          <Monitor size={12} />
                          Lancer
                          <ChevronRight size={12} />
                        </Link>
                      ) : m.visibility !== 'countdown' ? (
                        <span className="flex items-center gap-1.5 text-light-text-muted dark:text-text-secondary text-xs">
                          <Monitor size={12} />
                          Aperçu disponible
                        </span>
                      ) : null}

                      {/* Badge participants (privé) */}
                      {m.visibility === 'private' && (isOwner || isAdmin) && (
                        <span className="ml-auto text-[10px] text-light-text-muted dark:text-text-secondary">
                          {m.allowedParticipants.length} participant{m.allowedParticipants.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </Card>

                  {/* Countdown affiché sous la carte */}
                  {m.visibility === 'countdown' && m.publishAt && (
                    <CountdownTimer
                      publishAt={m.publishAt.toISOString()}
                      message={m.countdownMessage}
                      moduleTitle={m.title}
                      showCta={!session}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* CTA visiteur */}
        {!session && (
          <div className="mt-12 text-center p-8 rounded-2xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface">
            <p className="text-sm text-light-text-muted dark:text-text-secondary mb-4">
              Connectez-vous pour accéder à vos modules privés et lancer des présentations.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-[#111] text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              <Monitor size={14} />
              Se connecter
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <p className="text-center py-4 text-xs text-light-text/30 dark:text-dark-text/30">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
