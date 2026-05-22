import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Monitor, Calendar, PenTool, Zap, Users, BarChart2 } from 'lucide-react'
import { OnboardingWizard } from '@/components/formateur/onboarding-wizard'
import { FormateurStatsCharts } from '@/components/formateur/stats-charts'

export default async function FormateurPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const appUser = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { moduleIds: true, firstLogin: true, onboardingStep: true },
  })

  const assignedIds: string[] = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : []

  const moduleFilter = assignedIds.length ? { id: { in: assignedIds }, isDeleted: false } : { isDeleted: false }

  const [modules, nextSessions, exerciseCount, liveSessionCount, totalViewers] = await Promise.all([
    prisma.module.findMany({
      where: moduleFilter,
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: { where: { isDeleted: false } } } } },
    }),
    prisma.agendaSession.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 1,
    }),
    prisma.exercise.count({
      where: assignedIds.length ? { moduleId: { in: assignedIds }, isDeleted: false } : { isDeleted: false },
    }),
    prisma.liveSession.count({
      where: assignedIds.length ? { moduleId: { in: assignedIds } } : {},
    }),
    prisma.liveSession.aggregate({
      where: assignedIds.length ? { moduleId: { in: assignedIds } } : {},
      _sum: { viewerCount: true },
    }),
  ])

  const nextSession = nextSessions[0]
  const totalSlides = modules.reduce((s, m) => s + m._count.slides, 0)

  const stats = [
    { icon: BookOpen, value: modules.length,                           label: 'Modules assignés',   color: '#00D4FF' },
    { icon: Monitor,  value: totalSlides,                              label: 'Slides total',        color: '#C8B89A' },
    { icon: PenTool,  value: exerciseCount,                            label: 'Exercices',           color: '#8b5cf6' },
    { icon: Zap,      value: liveSessionCount,                         label: 'Sessions live',       color: '#10b981' },
    { icon: Users,    value: totalViewers._sum.viewerCount ?? 0,       label: 'Participants (total)', color: '#f59e0b' },
    { icon: BarChart2,value: nextSession ? '1 planifiée' : 'Aucune',  label: 'Prochaine session',   color: '#ec4899' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {appUser?.firstLogin && (
        <OnboardingWizard initialStep={appUser.onboardingStep ?? 0} />
      )}

      {/* En-tête */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-1">Espace formateur</p>
        <h1 className="font-syne text-3xl font-bold text-light-text dark:text-white mb-1">
          Bonjour, {session.user.name?.split(' ')[0] ?? 'Formateur'}
        </h1>
        <p className="text-sm text-light-text/50 dark:text-dark-text/50">Tableau de bord — DeckTrain</p>
      </div>

      {/* 6 stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: color + '18' }}>
              <Icon size={15} style={{ color }} />
            </div>
            <p className="text-xl font-bold text-light-text dark:text-dark-text leading-none mb-1">{value}</p>
            <p className="text-[10px] text-light-text/45 dark:text-dark-text/45 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Prochaine session */}
      {nextSession && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mb-0.5">Prochaine session</p>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">{nextSession.title}</p>
            <p className="text-xs text-light-text/50 dark:text-dark-text/50">
              {new Date(nextSession.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {nextSession.startTime && ` · ${nextSession.startTime}`}
            </p>
          </div>
          <Link href="/agenda" className="ml-auto text-xs text-accent hover:underline whitespace-nowrap">
            Voir l'agenda →
          </Link>
        </div>
      )}

      {/* Graphiques */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-light-text/35 dark:text-dark-text/35 mb-4">
          Statistiques
        </p>
        <FormateurStatsCharts />
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link
          href="/formateur/modules"
          className="flex items-center gap-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 hover:border-accent/30 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">Mes modules</p>
            <p className="text-xs text-light-text/45 dark:text-dark-text/45">{modules.length} disponible{modules.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>
        <Link
          href="/agenda"
          className="flex items-center gap-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 hover:border-or/30 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-or/8 text-or flex items-center justify-center group-hover:bg-or/15 transition-colors">
            <Calendar size={16} />
          </div>
          <div>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">Agenda</p>
            <p className="text-xs text-light-text/45 dark:text-dark-text/45">Planning des sessions</p>
          </div>
        </Link>
      </div>

      {/* Modules liste */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-light-text/35 dark:text-dark-text/35">
            Mes modules
          </p>
          <Link href="/formateur/modules" className="text-xs text-accent hover:underline">Voir tout</Link>
        </div>

        {modules.length === 0 ? (
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center">
            <BookOpen size={28} className="mx-auto mb-3 text-light-text/20 dark:text-dark-text/20" />
            <p className="text-sm text-light-text/50 dark:text-dark-text/50">Aucun module ne vous a encore été assigné.</p>
            <p className="text-xs text-light-text/30 dark:text-dark-text/30 mt-1">Contactez votre administrateur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.slice(0, 6).map((mod) => (
              <div
                key={mod.id}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 group hover:border-accent/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-light-text/40 dark:text-dark-text/40">{mod._count.slides} slides</span>
                  </div>
                </div>
                <h3 className="font-medium text-light-text dark:text-dark-text text-sm mb-3 line-clamp-2">{mod.title}</h3>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/present/${mod.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 text-xs text-accent font-medium hover:underline transition-colors"
                  >
                    <Monitor size={12} />
                    Présenter
                  </Link>
                  <span className="text-light-text/20 dark:text-dark-text/20">·</span>
                  <Link
                    href={`/formateur/modules/${mod.id}/stats`}
                    className="text-xs text-light-text/45 dark:text-dark-text/45 hover:text-accent transition-colors"
                  >
                    Stats →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-light-text/25 dark:text-dark-text/25 text-center mt-12">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
