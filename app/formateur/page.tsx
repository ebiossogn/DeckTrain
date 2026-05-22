import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { BookOpen, Monitor, Calendar, PenTool } from 'lucide-react'
import { OnboardingWizard } from '@/components/formateur/onboarding-wizard'

export default async function FormateurPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  // Récupérer les moduleIds assignés au formateur
  const appUser = await prisma.appUser.findUnique({
    where: { id: session.user.id },
    select: { moduleIds: true, firstLogin: true, onboardingStep: true },
  })

  const assignedIds: string[] | null = appUser?.moduleIds
    ? (JSON.parse(appUser.moduleIds) as string[])
    : null

  const [modules, sessions, exercises] = await Promise.all([
    prisma.module.findMany({
      where: assignedIds?.length ? { id: { in: assignedIds } } : undefined,
      orderBy: { order: 'asc' },
      include: { _count: { select: { slides: true } } },
    }),
    prisma.agendaSession.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 1,
    }),
    prisma.exercise.count({
      where: assignedIds?.length ? { moduleId: { in: assignedIds } } : undefined,
    }),
  ])

  const nextSession = sessions[0]

  return (
    <div className="max-w-5xl mx-auto">
      {appUser?.firstLogin && (
        <OnboardingWizard initialStep={appUser.onboardingStep ?? 0} />
      )}
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-light text-light-text dark:text-white mb-1">
          Bonjour, {session.user.name?.split(' ')[0] ?? 'Formateur'} 👋
        </h1>
        <p className="text-text-secondary text-sm">Tableau de bord formateur — DeckTrain</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, value: modules.length,                                    label: 'Mes modules',       color: '#00D4FF' },
          { icon: Monitor,  value: modules.reduce((a, m) => a + m._count.slides, 0),  label: 'Slides total',      color: '#C8B89A' },
          { icon: Calendar, value: nextSession ? '1' : '0',                           label: 'Prochaine session',  color: '#8b5cf6' },
          { icon: PenTool,  value: exercises,                                          label: 'Exercices',          color: '#10b981' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: color + '18' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-2xl font-bold text-light-text dark:text-dark-text">{value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{label}</p>
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
            <p className="text-xs label-dt text-accent mb-0.5">Prochaine session</p>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">{nextSession.title}</p>
            <p className="text-xs text-text-secondary">
              {new Date(nextSession.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              {nextSession.startTime && ` · ${nextSession.startTime}`}
            </p>
          </div>
          <Link href="/agenda" className="ml-auto text-xs text-accent hover:underline whitespace-nowrap">
            Voir l'agenda →
          </Link>
        </div>
      )}

      {/* Accès rapides */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/formateur/modules"
          className="flex items-center gap-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 hover:border-accent/30 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">Mes modules</p>
            <p className="text-xs text-text-secondary">{modules.length} disponible{modules.length !== 1 ? 's' : ''}</p>
          </div>
        </Link>
        <Link href="/agenda"
          className="flex items-center gap-3 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 hover:border-or/30 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-or/8 text-or flex items-center justify-center group-hover:bg-or/15 transition-colors">
            <Calendar size={16} />
          </div>
          <div>
            <p className="font-medium text-light-text dark:text-dark-text text-sm">Agenda</p>
            <p className="text-xs text-text-secondary">Planning des sessions</p>
          </div>
        </Link>
      </div>

      {/* Modules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="label-dt text-text-secondary">Mes modules</p>
          <Link href="/formateur/modules" className="text-xs text-accent hover:underline">Voir tout</Link>
        </div>

        {modules.length === 0 ? (
          <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-12 text-center">
            <BookOpen size={28} className="mx-auto mb-3 text-text-muted" />
            <p className="text-sm text-text-secondary">Aucun module ne vous a encore été assigné.</p>
            <p className="text-xs text-text-muted mt-1">Contactez votre administrateur.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.slice(0, 6).map((mod) => (
              <div key={mod.id} className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4 group hover:border-accent/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <BookOpen size={16} />
                  </div>
                  <span className="label-dt text-text-muted">{mod._count.slides} slides</span>
                </div>
                <h3 className="font-medium text-light-text dark:text-dark-text text-sm mb-3 line-clamp-2">{mod.title}</h3>
                <Link
                  href={`/present/${mod.id}`}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent font-medium transition-colors"
                >
                  <Monitor size={12} />
                  Lancer la présentation
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
