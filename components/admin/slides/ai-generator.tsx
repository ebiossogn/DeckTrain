'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, RefreshCw, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { SlideWithContent } from '@/types/slides'

// ── Types preview ─────────────────────────────────────────────────────────────

interface AITheme { background: string; accent: string; textColor: string }
interface AISlide {
  order: number; type: string
  theme?: AITheme
  content: Record<string, unknown>
  speakerNotes?: string
}
interface AIPreview { title: string; subtitle?: string; slides: AISlide[] }

// ── Tonalités disponibles ─────────────────────────────────────────────────────

const TONES = [
  { value: 'professionnel', emoji: '👔', label: 'Pro' },
  { value: 'pédagogique',   emoji: '📚', label: 'Pédago' },
  { value: 'technique',     emoji: '⚙️',  label: 'Tech' },
  { value: 'inspirant',     emoji: '🚀', label: 'Inspirant' },
  { value: 'décontracté',   emoji: '😊', label: 'Casual' },
  { value: 'storytelling',  emoji: '🎭', label: 'Story' },
]

const COUNTS = [5, 8, 10, 15, 20]

const LANGUAGES = [
  { value: 'français', flag: '🇫🇷', label: 'Français' },
  { value: 'english',  flag: '🇬🇧', label: 'English' },
  { value: 'arabic',   flag: '🇲🇦', label: 'العربية' },
]

// ── Mini aperçu d'un slide ────────────────────────────────────────────────────

function MiniSlide({ slide, idx }: { slide: AISlide; idx: number }) {
  const bg     = slide.theme?.background ?? '#0C0C14'
  const accent = slide.theme?.accent     ?? '#00D4FF'
  const c      = slide.content

  return (
    <div
      className="rounded-xl overflow-hidden border border-white/8 aspect-video relative flex flex-col p-2.5 gap-1 cursor-default select-none"
      style={{ background: bg }}
    >
      {/* Barre accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: accent }} />

      {/* Numéro + type */}
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[8px] font-mono opacity-30 text-white">{idx + 1}</span>
        <span className="text-[8px] opacity-25 text-white capitalize">{slide.type.replace('title-', '')}</span>
      </div>

      {/* Titre avec emoji */}
      <p className="font-bold text-white text-[10px] leading-tight line-clamp-2">
        {String(c.emoji ?? '')} {String(c.title ?? c.quote ?? '')}
      </p>

      {/* Contenu selon type */}
      {slide.type === 'title-bullets' && Array.isArray(c.bullets) && (
        <ul className="space-y-0.5">
          {(c.bullets as Array<{ text: string }>).slice(0, 3).map((b, i) => (
            <li key={i} className="text-[8px] opacity-50 text-white truncate flex items-center gap-1">
              <span style={{ color: accent }}>›</span> {b.text}
            </li>
          ))}
        </ul>
      )}

      {slide.type === 'quote' && (
        <p className="text-[8px] italic opacity-45 text-white line-clamp-2">
          &quot;{String(c.quote ?? '')}&quot;
        </p>
      )}

      {slide.type === 'comparison' && (
        <div className="flex gap-1 flex-1">
          {([c.leftTitle, c.rightTitle] as string[]).map((t, i) => (
            <div key={i} className="flex-1 rounded bg-white/8 px-1 py-0.5 text-[7px] opacity-60 text-white truncate">
              {t}
            </div>
          ))}
        </div>
      )}

      {slide.type === 'title-text' && !!c.body && (
        <p className="text-[8px] opacity-40 text-white line-clamp-2">
          {String(c.body).replace(/<[^>]+>/g, '')}
        </p>
      )}
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  moduleId: string
  onSuccess: (slides: SlideWithContent[]) => void
  onClose: () => void
}

type Step = 'form' | 'generating' | 'preview' | 'creating'

// ── Composant principal ───────────────────────────────────────────────────────

export function AIGeneratorModal({ moduleId, onSuccess, onClose }: Props) {
  const [step, setStep]         = useState<Step>('form')
  const [topic, setTopic]       = useState('')
  const [slideCount, setCount]  = useState(10)
  const [tone, setTone]         = useState('professionnel')
  const [audience, setAudience] = useState('équipe interne')
  const [language, setLang]     = useState('français')
  const [preview, setPreview]   = useState<AIPreview | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setMsg]   = useState('')
  const [error, setError]       = useState('')

  const formParams = { topic, slideCount, tone, audience, language }

  // ── Étape 1 : génération (mode preview) ───────────────────────────────────
  const handleGenerate = async () => {
    if (!topic.trim()) return
    setStep('generating')
    setError('')

    const steps = [
      [15,  'Analyse du sujet…'],
      [35,  'Structuration du plan…'],
      [60,  'Rédaction des slides…'],
      [80,  'Mise en forme…'],
      [95,  'Finalisation…'],
    ] as [number, string][]

    let si = 0
    const ticker = setInterval(() => {
      if (si < steps.length) {
        setProgress(steps[si][0])
        setMsg(steps[si][1])
        si++
      }
    }, 1800)

    try {
      const res  = await fetch(`/api/modules/${moduleId}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...formParams, mode: 'preview' }),
      })
      const data = await res.json()
      clearInterval(ticker)

      if (!res.ok) throw new Error(data.error ?? 'Génération échouée')

      setProgress(100)
      setMsg('Terminé !')
      setPreview(data.preview.presentation)
      setTimeout(() => setStep('preview'), 400)
    } catch (err) {
      clearInterval(ticker)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('form')
    }
  }

  // ── Étape 2 : création en DB ──────────────────────────────────────────────
  const handleCreate = async () => {
    if (!preview) return
    setStep('creating')

    try {
      const res  = await fetch(`/api/modules/${moduleId}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...formParams,
          mode:        'create',
          slides:      preview.slides,
          moduleTitle: preview.title,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Sauvegarde échouée')

      onSuccess(data.slides as SlideWithContent[])
      onClose()
      toast.success(`✨ ${data.created} slides générées avec succès !`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('preview')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={step === 'form' || step === 'preview' ? onClose : undefined}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className={`relative z-10 w-full bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-text/10 dark:border-dark-text/10 shadow-2xl shadow-black/40 overflow-hidden flex flex-col ${
          step === 'preview' ? 'max-w-3xl max-h-[90vh]' : 'max-w-lg'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-text/8 dark:border-dark-text/8 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center">
              <Sparkles size={15} className="text-accent" />
            </div>
            <h2 className="font-syne font-bold text-light-text dark:text-dark-text">
              {step === 'preview' ? `Aperçu — ${preview?.title ?? ''}` : 'Générer avec l\'IA'}
            </h2>
          </div>
          {(step === 'form' || step === 'preview') && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/8 dark:hover:bg-dark-text/8 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">

            {/* ── Formulaire ── */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-6">

                {/* Sujet */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                    Sujet de la formation *
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Introduction à Excel pour débutants en entreprise, Management d'équipe, Cybersécurité…"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 resize-none transition-all"
                  />
                </div>

                {/* Nombre de slides */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                    Nombre de slides
                  </label>
                  <div className="flex gap-2">
                    {COUNTS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                          slideCount === n
                            ? 'bg-accent/15 border-accent/50 text-accent'
                            : 'border-light-text/12 dark:border-dark-text/12 text-light-text/55 dark:text-dark-text/55 hover:border-accent/30 hover:text-accent'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ton */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                    Ton
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TONES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          tone === t.value
                            ? 'border-accent/50 bg-accent/10 text-accent'
                            : 'border-light-text/10 dark:border-dark-text/10 text-light-text/55 dark:text-dark-text/55 hover:border-accent/30'
                        }`}
                      >
                        <div className="text-xl mb-1">{t.emoji}</div>
                        <div className="text-[11px] font-medium">{t.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Public + Langue */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                      Public cible
                    </label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      placeholder="Managers, débutants…"
                      className="w-full rounded-xl px-3 py-2.5 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text placeholder:text-light-text/30 dark:placeholder:text-dark-text/30 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                      Langue
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLang(e.target.value)}
                      className="w-full rounded-xl px-3 py-2.5 text-sm bg-light-text/5 dark:bg-dark-text/5 border border-light-text/10 dark:border-dark-text/10 text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all appearance-none cursor-pointer"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>{l.flag} {l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                    >
                      <AlertCircle size={14} className="flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                  className="w-full py-3.5 rounded-xl font-syne font-bold text-dark-bg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #8b5cf6)' }}
                >
                  <Sparkles size={15} />
                  Générer ma présentation
                </button>

                <p className="text-center text-[10px] text-light-text/25 dark:text-dark-text/25">
                  © CHRIST J. — Propulsé par Claude AI · DeckTrain
                </p>
              </motion.div>
            )}

            {/* ── Génération en cours ── */}
            {(step === 'generating' || step === 'creating') && (
              <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-10 flex flex-col items-center justify-center gap-6 min-h-64"
              >
                {/* Spinner concentrique */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-accent/15 border-t-accent animate-spin" />
                  <div
                    className="absolute inset-3 rounded-full border-4 border-purple-500/15 border-b-purple-500 animate-spin"
                    style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
                </div>

                {/* Barre de progression */}
                <div className="w-full max-w-xs space-y-2">
                  <div className="h-1.5 rounded-full bg-light-text/8 dark:bg-dark-text/8 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #00D4FF, #8b5cf6)' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-xs text-center text-light-text/50 dark:text-dark-text/50">{progressMsg}</p>
                </div>

                <p className="text-[10px] text-light-text/25 dark:text-dark-text/25">
                  {step === 'creating' ? 'Création des slides en base…' : 'Propulsé par Claude AI'}
                </p>
              </motion.div>
            )}

            {/* ── Aperçu ── */}
            {step === 'preview' && preview && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">

                {/* Métadonnées */}
                <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-light-text/4 dark:bg-dark-text/4 border border-light-text/8 dark:border-dark-text/8">
                  <div>
                    <p className="font-syne font-bold text-light-text dark:text-dark-text">{preview.title}</p>
                    {preview.subtitle && (
                      <p className="text-sm text-light-text/50 dark:text-dark-text/50 mt-0.5">{preview.subtitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-light-text/40 dark:text-dark-text/40 flex-shrink-0 mt-1">
                    {preview.slides.length} slides
                  </span>
                </div>

                {/* Grille miniatures */}
                <div className="grid grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
                  {preview.slides.map((slide, i) => (
                    <MiniSlide key={i} slide={slide} idx={i} />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <Button
                    variant="secondary" size="sm"
                    className="flex-1"
                    onClick={() => { setPreview(null); setStep('form') }}
                  >
                    <RefreshCw size={13} /> Régénérer
                  </Button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-2 rounded-xl font-syne font-bold text-dark-bg text-sm flex items-center justify-center gap-1.5 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00D4FF, #8b5cf6)' }}
                  >
                    <CheckCircle2 size={14} /> Créer ces {preview.slides.length} slides
                  </button>
                </div>

                <p className="text-center text-[10px] text-light-text/25 dark:text-dark-text/25">
                  © CHRIST J. — DeckTrain
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
