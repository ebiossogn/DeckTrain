import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, PenTool, Calendar, BarChart2 } from 'lucide-react'

export default async function ParticipantPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const [modules, nextSessions, activeSurveys] = await Promise.all([
    prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true } } },
    }),
    prisma.agendaSession.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 1,
    }),
    prisma.survey.findMany({
      where: { isActive: true },
      take: 3,
    }),
  ])

  const nextSession = nextSessions[0]

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-light-text dark:text-white mb-1">
          Bienvenue, {session.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-text-secondary text-sm">Votre espace de formation DeckTrain</p>
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { href: '/exercises', icon: PenTool,  label: 'Exercices',  sub: 'QCM & Ateliers',  color: '#00D4FF' },
          { href: '/agenda',    icon: Calendar, label: 'Agenda',     sub: 'Planning',         color: '#C8B89A' },
          { href: '/surveys',   icon: BarChart2,label: 'Sondages',   sub: activeSurveys.length + ' en cours', color: '#8b5cf6' },
          { href: '#modules',   icon: BookOpen, label: 'Formations', sub: modules.length + ' modules', color: '#10b981' },
        ].map(({ href, icon: Icon, label, sub, color }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 hover:border-accent/30 transition-all group text-center"
          >
            <div className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: color + '18' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <p className="font-medium text-light-text dark:text-dark-text text-sm">{label}</p>
              <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Prochaine session */}
      {nextSession && (
        <div className="bg-or/5 border border-or/20 rounded-2xl px-5 py-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-or/10 text-or flex items-center justify-center flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-xs label-dt text-or mb-0.5">Prochaine session</p>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">{nextSession.title}</p>
            <p className="text-xs text-text-secondary">
              {new Date(nextSession.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {nextSession.startTime && ` · ${nextSession.startTime}`}
              {nextSession.location && ` · ${nextSession.location}`}
            </p>
          </div>
          <Link href="/agenda" className="ml-auto text-xs text-or hover:underline whitespace-nowrap">Voir l'agenda →</Link>
        </div>
      )}

      {/* Sondages actifs */}
      {activeSurveys.length > 0 && (
        <div className="mb-8">
          <p className="label-dt text-text-secondary mb-3">Sondages en cours</p>
          <div className="space-y-2">
            {activeSurveys.map((survey) => (
              <Link key={survey.id} href={`/surveys/${survey.code}`}
                className="flex items-center justify-between bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl px-4 py-3 hover:border-accent/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">{survey.title}</p>
                </div>
                <span className="text-xs text-accent group-hover:underline">Répondre →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modules */}
      <div id="modules">
        <p className="label-dt text-text-secondary mb-4">Formations disponibles</p>
        <div className="space-y-2">
          {modules.map((mod) => (
            <div key={mod.id}
              className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl px-5 py-3.5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-or/8 text-or flex items-center justify-center">
                  <BookOpen size={15} />
                </div>
                <div>
                  <p className="font-medium text-light-text dark:text-dark-text text-sm">{mod.title}</p>
                  <p className="text-xs text-text-secondary">{mod._count.slides} slides</p>
                </div>
              </div>
              <span className="label-dt text-text-muted">Lecture seule</span>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="text-center py-12 text-text-secondary text-sm">Aucune formation disponible pour le moment.</p>
          )}
        </div>
      </div>
    </div>
  )
}
