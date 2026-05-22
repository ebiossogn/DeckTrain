'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BookOpen, Monitor, ExternalLink, Radio,
  Globe, Lock, Timer, ChevronDown, Users,
  UserPlus, UserMinus, Search, X, Loader2,
} from 'lucide-react'
import { LiveModal } from '@/components/live/live-modal'
import { cn } from '@/lib/utils'

type Visibility = 'public' | 'private' | 'countdown'

interface Participant { id: string; name: string; email: string }

interface ModuleItem {
  id: string
  title: string
  description: string | null
  slidesCount: number
  exercisesCount: number
  liveCode: string | null
  visibility: Visibility
  publishAt: string | null
  countdownMessage: string | null
  createdBy: string | null
  allowedParticipants: Participant[]
}

const VIS_CONFIG: Record<Visibility, { label: string; icon: typeof Globe; cls: string }> = {
  public:    { label: 'Public',    icon: Globe,  cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  private:   { label: 'Privé',     icon: Lock,   cls: 'bg-light-text/5 dark:bg-dark-text/5 text-light-text-muted dark:text-text-secondary border-light-border dark:border-dark-border' },
  countdown: { label: 'Countdown', icon: Timer,  cls: 'bg-or/10 text-or border-or/20' },
}

const COUNTDOWN_PRESETS = [
  '✨ Cette formation arrive bientôt — Préparez-vous à transformer vos compétences !',
  '🔮 Une nouvelle formation arrive bientôt. Ceux qui s\'inscriront en premier auront un avantage certain.',
  '⚡ Places limitées ! Cette formation sera accessible dans peu de temps. Inscrivez-vous maintenant.',
  '🌍 Rejoignez des centaines de professionnels qui se forment sur DeckTrain. Cette formation ouvre bientôt.',
  '🎯 Votre prochaine montée en compétences commence ici. Le formateur finalise les derniers détails.',
]

/* ── Panneau visibilité ───────────────────────────────────────────── */
function VisibilityPanel({
  module,
  userId,
  allParticipants,
  onUpdated,
}: {
  module: ModuleItem
  userId: string
  allParticipants: Participant[]
  onUpdated: (m: Partial<ModuleItem>) => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [vis, setVis] = useState<Visibility>(module.visibility)
  const [publishAt, setPublishAt] = useState(module.publishAt?.slice(0, 16) ?? '')
  const [message, setMessage] = useState(module.countdownMessage ?? '')
  const [search, setSearch] = useState('')
  const [participantsPending, setParticipantsPending] = useState(false)

  const isOwner = module.createdBy === userId
  if (!isOwner) return null

  const saveVisibility = async (newVis: Visibility) => {
    setVis(newVis)
    const res = await fetch(`/api/modules/${module.id}/visibility`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visibility: newVis,
        publishAt: newVis === 'countdown' && publishAt ? publishAt + ':00Z' : null,
        countdownMessage: newVis === 'countdown' ? message || null : null,
      }),
    })
    if (res.ok) {
      onUpdated({ visibility: newVis })
      toast.success('Visibilité mise à jour')
      startTransition(() => router.refresh())
    } else {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const saveCountdownConfig = async () => {
    await saveVisibility('countdown')
  }

  const addParticipant = async (p: Participant) => {
    setParticipantsPending(true)
    const res = await fetch(`/api/modules/${module.id}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: p.id }),
    })
    setParticipantsPending(false)
    if (res.ok) {
      onUpdated({ allowedParticipants: [...module.allowedParticipants, p] })
      toast.success(`${p.name} ajouté`)
      startTransition(() => router.refresh())
    }
  }

  const removeParticipant = async (p: Participant) => {
    setParticipantsPending(true)
    const res = await fetch(`/api/modules/${module.id}/participants`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participantId: p.id }),
    })
    setParticipantsPending(false)
    if (res.ok) {
      onUpdated({ allowedParticipants: module.allowedParticipants.filter(x => x.id !== p.id) })
      toast.success(`${p.name} retiré`)
      startTransition(() => router.refresh())
    }
  }

  const assignedIds = new Set(module.allowedParticipants.map(p => p.id))
  const filtered = allParticipants.filter(p =>
    !assignedIds.has(p.id) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) ||
     p.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="border-t border-light-border dark:border-dark-border pt-4 mt-4 space-y-4">
      {/* Sélecteur visibilité */}
      <div>
        <p className="text-[10px] font-semibold text-light-text-muted dark:text-text-secondary mb-2 label-dt">Visibilité</p>
        <div className="flex items-center gap-2">
          {(Object.keys(VIS_CONFIG) as Visibility[]).map((v) => {
            const cfg = VIS_CONFIG[v]
            const Icon = cfg.icon
            return (
              <button
                key={v}
                onClick={() => v !== 'countdown' ? saveVisibility(v) : setVis('countdown')}
                disabled={pending}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                  vis === v ? cfg.cls : 'border-light-border dark:border-dark-border text-light-text-muted dark:text-text-secondary hover:border-accent/30'
                )}
              >
                <Icon size={11} />
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Config countdown */}
      {vis === 'countdown' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2.5"
        >
          <div>
            <label className="text-[10px] text-light-text-muted dark:text-text-secondary label-dt block mb-1">Date de publication</label>
            <input
              type="datetime-local"
              value={publishAt}
              onChange={e => setPublishAt(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs bg-light-text/5 dark:bg-dark-text/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div>
            <label className="text-[10px] text-light-text-muted dark:text-text-secondary label-dt block mb-1">Message accrocheur</label>
            <div className="flex gap-1 mb-1.5 flex-wrap">
              {COUNTDOWN_PRESETS.map((p, i) => (
                <button key={i} onClick={() => setMessage(p)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-or/10 text-or hover:bg-or/20 transition-colors">
                  Modèle {i + 1}
                </button>
              ))}
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              placeholder="Message affiché pendant le countdown…"
              className="w-full rounded-xl px-3 py-2 text-xs bg-light-text/5 dark:bg-dark-text/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text placeholder:text-light-text-muted dark:placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none"
            />
          </div>
          <button
            onClick={saveCountdownConfig}
            disabled={!publishAt || pending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-or text-[#111] text-xs font-semibold hover:bg-or/90 disabled:opacity-40 transition-colors"
          >
            {pending ? <Loader2 size={11} className="animate-spin" /> : <Timer size={11} />}
            Enregistrer le countdown
          </button>
        </motion.div>
      )}

      {/* Gestion participants (module privé) */}
      {vis === 'private' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-2.5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-light-text-muted dark:text-text-secondary label-dt">
              Participants assignés
              <span className="ml-1.5 px-1.5 py-0.5 rounded bg-accent/10 text-accent">{module.allowedParticipants.length}</span>
            </p>
            {participantsPending && <Loader2 size={11} className="animate-spin text-accent" />}
          </div>

          {/* Liste assignés */}
          {module.allowedParticipants.length > 0 && (
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {module.allowedParticipants.map(p => (
                <div key={p.id} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-light-text/3 dark:bg-dark-text/3 text-xs">
                  <span className="text-light-text dark:text-dark-text">{p.name}</span>
                  <button onClick={() => removeParticipant(p)}
                    className="text-red-400 hover:text-red-300 transition-colors">
                    <UserMinus size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recherche + ajout */}
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-text-secondary" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un participant…"
              className="w-full rounded-xl pl-7 pr-3 py-1.5 text-xs bg-light-text/5 dark:bg-dark-text/5 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text placeholder:text-light-text-muted dark:placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {search && filtered.length > 0 && (
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {filtered.slice(0, 6).map(p => (
                <button key={p.id} onClick={() => { addParticipant(p); setSearch('') }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent/8 text-xs transition-colors text-left">
                  <div>
                    <span className="text-light-text dark:text-dark-text">{p.name}</span>
                    <span className="text-light-text-muted dark:text-text-secondary ml-1.5">{p.email}</span>
                  </div>
                  <UserPlus size={11} className="text-accent flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
          {search && filtered.length === 0 && (
            <p className="text-[10px] text-light-text-muted dark:text-text-secondary px-1">Aucun participant trouvé.</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ── Composant principal ─────────────────────────────────────────── */
export function FormateurModulesClient({
  modules: initial,
  userId,
  allParticipants,
}: {
  modules: ModuleItem[]
  userId: string
  allParticipants: Participant[]
}) {
  const [modules, setModules] = useState(initial)
  const [liveTarget, setLiveTarget] = useState<ModuleItem | null>(null)
  const [expandedVis, setExpandedVis] = useState<string | null>(null)

  const updateModule = (id: string, patch: Partial<ModuleItem>) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, ...patch } : m))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-light-text dark:text-white mb-1">Mes modules</h1>
        <p className="text-text-secondary text-sm">
          {modules.length} module{modules.length !== 1 ? 's' : ''} disponible{modules.length !== 1 ? 's' : ''}
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-16 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm text-text-secondary mb-1">Aucun module disponible.</p>
          <p className="text-xs text-text-muted">Créez un module depuis l'interface d'administration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.map((mod) => {
            const visCfg = VIS_CONFIG[mod.visibility]
            const VisIcon = visCfg.icon
            const isOwner = mod.createdBy === userId
            const visExpanded = expandedVis === mod.id

            return (
              <div key={mod.id}
                className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 group hover:border-accent/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.06)] transition-all"
              >
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/8 text-accent flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex items-center gap-2">
                    {mod.liveCode && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 text-[10px] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        LIVE · {mod.liveCode}
                      </span>
                    )}
                    {/* Badge visibilité */}
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold', visCfg.cls)}>
                      <VisIcon size={9} />
                      {visCfg.label}
                    </span>
                    <span className="label-dt text-text-muted">{mod.slidesCount} slides</span>
                    <span className="label-dt text-text-muted">·</span>
                    <span className="label-dt text-text-muted">{mod.exercisesCount} exos</span>
                  </div>
                </div>

                <h3 className="font-display font-semibold text-or mb-1">{mod.title}</h3>
                {mod.description && (
                  <p className="text-xs text-text-secondary mb-4 line-clamp-2">{mod.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-light-border dark:border-dark-border flex-wrap">
                  <Link
                    href={`/present/${mod.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-[#111] text-xs font-semibold hover:bg-accent/90 transition-colors"
                  >
                    <Monitor size={12} />
                    Présenter
                  </Link>

                  <button
                    onClick={() => setLiveTarget(mod)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
                  >
                    <Radio size={12} />
                    {mod.liveCode ? 'Session live' : 'Présenter en live'}
                  </button>

                  <Link
                    href={`/print/${mod.id}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border text-xs text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
                  >
                    <ExternalLink size={12} />
                    PDF
                  </Link>

                  {/* Visibilité (formateur propriétaire uniquement) */}
                  {isOwner && (
                    <button
                      onClick={() => setExpandedVis(visExpanded ? null : mod.id)}
                      className={cn(
                        'ml-auto flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-colors',
                        visExpanded
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:text-accent hover:bg-accent/8'
                      )}
                    >
                      <Users size={12} />
                      Visibilité
                      <ChevronDown size={11} className={cn('transition-transform', visExpanded && 'rotate-180')} />
                    </button>
                  )}
                </div>

                {/* Panneau visibilité dépliable */}
                <AnimatePresence>
                  {visExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <VisibilityPanel
                        module={mod}
                        userId={userId}
                        allParticipants={allParticipants}
                        onUpdated={(patch) => updateModule(mod.id, patch)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {liveTarget && (
          <LiveModal
            moduleId={liveTarget.id}
            moduleTitle={liveTarget.title}
            onClose={() => setLiveTarget(null)}
          />
        )}
      </AnimatePresence>

      <p className="text-center mt-10 text-xs text-light-text/30 dark:text-dark-text/30">
        © CHRIST J. — Tous droits réservés
      </p>
    </div>
  )
}
