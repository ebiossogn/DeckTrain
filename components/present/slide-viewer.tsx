'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  FileText, LayoutGrid, Timer, Home, X, Radio,
} from 'lucide-react'
import type { SlideWithContent, TransitionType } from '@/types/slides'
import { SLIDE_TYPE_LABELS } from '@/types/slides'
import { SlideRenderer } from '@/components/slides/slide-renderer'
import { LiveModal } from '@/components/live/live-modal'
import { cn } from '@/lib/utils'

/* ── Variants par type de transition ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnimState = any

interface SlideVariants {
  initial:    AnimState
  animate:    AnimState
  exit:       AnimState
  transition: AnimState
}

function getSlideVariants(type: TransitionType | null, dir: number): SlideVariants {
  const ease = 'easeInOut'
  switch (type) {
    case 'fade':
      return { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } }
    case 'slide-right':
      return { initial: { x: '-100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: '100%', opacity: 0 }, transition: { duration: 0.3, ease } }
    case 'slide-up':
      return { initial: { y: '100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '-100%', opacity: 0 }, transition: { duration: 0.3, ease } }
    case 'slide-down':
      return { initial: { y: '-100%', opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: '100%', opacity: 0 }, transition: { duration: 0.3, ease } }
    case 'zoom-in':
      return { initial: { scale: 0.75, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 1.15, opacity: 0 }, transition: { duration: 0.35, ease } }
    case 'zoom-out':
      return { initial: { scale: 1.25, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 }, transition: { duration: 0.35, ease } }
    case 'flip':
      return { initial: { rotateY: dir > 0 ? 90 : -90, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: dir < 0 ? 90 : -90, opacity: 0 }, transition: { duration: 0.4, ease } }
    case 'bounce':
      return { initial: { y: '-60%', opacity: 0, scale: 0.9 }, animate: { y: 0, opacity: 1, scale: 1 }, exit: { y: '30%', opacity: 0, scale: 0.95 }, transition: { type: 'spring', stiffness: 260, damping: 22 } }
    case 'rotate':
      return { initial: { rotate: dir > 0 ? 8 : -8, scale: 0.85, opacity: 0 }, animate: { rotate: 0, scale: 1, opacity: 1 }, exit: { rotate: dir < 0 ? 8 : -8, scale: 0.85, opacity: 0 }, transition: { duration: 0.38, ease } }
    case 'slide-left':
    default:
      return { initial: { x: dir > 0 ? '100%' : '-100%', opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: dir < 0 ? '100%' : '-100%', opacity: 0 }, transition: { duration: 0.3, ease } }
  }
}

/* ── Composant Timer circulaire ── */
function TimerWidget({ minutes, slideId }: { minutes: number; slideId: string }) {
  const total = minutes * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(true)

  useEffect(() => { setLeft(total); setRunning(total > 0) }, [slideId, total])

  useEffect(() => {
    if (!running || left <= 0) return
    const id = setInterval(() => setLeft((t) => { if (t <= 1) { setRunning(false); return 0 } return t - 1 }), 1000)
    return () => clearInterval(id)
  }, [running, left])

  const pct = total > 0 ? left / total : 0
  const r = 18
  const circ = 2 * Math.PI * r
  const urgent = left <= 30 && left > 0

  const mm = String(Math.floor(left / 60)).padStart(2, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className={cn('flex items-center gap-1.5 px-2', urgent && 'animate-pulse')}>
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="22" cy="22" r={r} fill="none"
          stroke={urgent ? '#f87171' : '#00D4FF'} strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <span className={cn('font-mono text-sm', urgent ? 'text-red-400' : 'text-dark-text/70')}>
        {mm}:{ss}
      </span>
    </div>
  )
}

/* ── Drawer miniatures ── */
function ThumbnailsDrawer({
  open, slides, current, onSelect, onClose,
}: {
  open: boolean; slides: SlideWithContent[]; current: number
  onSelect: (i: number) => void; onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="absolute top-0 right-0 bottom-0 w-56 bg-dark-surface/95 border-l border-white/8 backdrop-blur-xl z-40 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
            <span className="text-xs font-medium text-dark-text/50 uppercase tracking-wide">Slides</span>
            <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-dark-text/40 hover:text-dark-text transition-colors">
              <X size={13} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { onSelect(i); onClose() }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-colors text-xs',
                  i === current
                    ? 'bg-accent/15 text-accent'
                    : 'text-dark-text/60 hover:bg-white/5 hover:text-dark-text'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono opacity-50 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-medium">
                      {(s.content as unknown as Record<string, unknown>).title as string || (s.content as unknown as Record<string, unknown>).quote as string || '—'}
                    </div>
                    <div className="text-[10px] opacity-50 mt-0.5">{SLIDE_TYPE_LABELS[s.type]}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

/* ── Panneau notes présentateur ── */
function PresenterNotes({ open, notes }: { open: boolean; notes?: string | null }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="absolute bottom-14 left-0 right-0 z-30 max-h-44 bg-dark-surface/95 border-t border-white/10 backdrop-blur-xl overflow-y-auto"
        >
          <div className="px-8 py-4">
            <p className="text-[10px] font-medium text-dark-text/35 uppercase tracking-widest mb-2">
              Notes présentateur
            </p>
            <p className="font-inter text-sm text-dark-text/75 leading-relaxed">
              {notes?.trim() || <em className="opacity-40">Aucune note pour ce slide.</em>}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Viewer principal ── */
interface Props {
  moduleId: string
  moduleTitle: string
  slides: SlideWithContent[]
  liveCode?: string | null
}

export function SlideViewer({ moduleId, moduleTitle, slides, liveCode }: Props) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [presenterMode, setPresenterMode] = useState(false)
  const [showThumbs, setShowThumbs] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [liveViewers, setLiveViewers] = useState<number | null>(null)
  const [showLiveModal, setShowLiveModal] = useState(false)

  const idxRef = useRef(idx)
  idxRef.current = idx
  const lenRef = useRef(slides.length)
  lenRef.current = slides.length

  // Synchroniser le slide courant vers la session live
  const syncLive = useCallback(async (slideIndex: number) => {
    if (!liveCode) return
    fetch(`/api/live/${liveCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentSlideIndex: slideIndex }),
    }).catch(() => null)
  }, [liveCode])

  // Polling du compteur de participants live (toutes les 5s)
  useEffect(() => {
    if (!liveCode) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/live/${liveCode}`)
        if (res.ok) {
          const data = await res.json()
          setLiveViewers(data.viewerCount ?? 0)
        }
      } catch { /* silencieux */ }
    }
    poll()
    const id = setInterval(poll, 5000)
    return () => clearInterval(id)
  }, [liveCode])

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= lenRef.current) return
    setDir(next > idxRef.current ? 1 : -1)
    setIdx(next)
    setShowControls(true)
    syncLive(next)
  }, [syncLive])

  const goNext = useCallback(() => goTo(idxRef.current + 1), [goTo])
  const goPrev = useCallback(() => goTo(idxRef.current - 1), [goTo])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  /* Keyboard */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight': case ' ': e.preventDefault(); goNext(); break
        case 'ArrowLeft':  e.preventDefault(); goPrev(); break
        case 'f': case 'F': toggleFullscreen(); break
        case 'p': case 'P': setPresenterMode((v) => !v); break
        case 't': case 'T': setShowThumbs((v) => !v); break
        case 'Escape':
          setPresenterMode(false)
          setShowThumbs(false)
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, toggleFullscreen])

  /* Fullscreen change */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  /* Auto-hide controls */
  useEffect(() => {
    setShowControls(true)
    const id = setTimeout(() => setShowControls(false), 3500)
    return () => clearTimeout(id)
  }, [idx])

  /* Touch/swipe */
  const touchX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) diff > 0 ? goNext() : goPrev()
    touchX.current = null
  }

  if (slides.length === 0) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-dark-bg text-dark-text/50">
        <p className="font-syne text-2xl mb-4">Aucun slide dans ce module</p>
        <Link href="/present" className="text-accent hover:underline text-sm">← Retour aux modules</Link>
      </div>
    )
  }

  const slide = slides[idx]
  const progress = slides.length > 1 ? (idx / (slides.length - 1)) * 100 : 100
  const hasTimer = (slide.timerMinutes ?? 0) > 0
  const sv = getSlideVariants(slide.transition ?? null, dir)

  return (
    <div
      className="w-screen h-screen bg-dark-bg relative overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={() => setShowControls(true)}
    >
      {/* ── Barre de progression ── */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/8 z-50">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>

      {/* ── Slide avec transition dynamique ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={sv.initial}
          animate={sv.animate}
          exit={sv.exit}
          transition={sv.transition}
          className="absolute inset-0"
          style={{ perspective: 1200 }}
        >
          <SlideRenderer slide={slide} />
        </motion.div>
      </AnimatePresence>

      {/* ── Notes présentateur ── */}
      <PresenterNotes open={presenterMode} notes={slide.speakerNotes} />

      {/* ── Drawer miniatures ── */}
      <ThumbnailsDrawer
        open={showThumbs}
        slides={slides}
        current={idx}
        onSelect={goTo}
        onClose={() => setShowThumbs(false)}
      />

      {/* ── Barre de contrôles (apparaît au survol) ── */}
      <motion.div
        animate={{ opacity: showControls ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-0 left-0 right-0 z-40 pointer-events-none"
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="pointer-events-auto flex items-center justify-between px-6 py-3 bg-gradient-to-t from-black/70 to-transparent">
          {/* Gauche : home + module + badge live */}
          <div className="flex items-center gap-3">
            <Link
              href="/present"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 text-dark-text/60 hover:text-accent hover:bg-white/15 transition-colors"
              title="Retour aux modules"
            >
              <Home size={14} />
            </Link>
            <span className="text-xs text-dark-text/40 hidden md:block truncate max-w-48">{moduleTitle}</span>
            {liveCode ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-mono text-red-400">{liveCode}</span>
                {liveViewers !== null && (
                  <span className="text-[10px] text-red-400/60">{liveViewers} viewer{liveViewers !== 1 ? 's' : ''}</span>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLiveModal(true)}
                title="Présenter en live"
                className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/8 text-dark-text/60 hover:bg-red-500/15 hover:text-red-400 transition-colors text-[10px] font-medium"
              >
                <Radio size={12} />
                Live
              </button>
            )}
          </div>

          {/* Centre : prev / counter / timer / next */}
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={idx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 text-dark-text/70 hover:text-dark-text hover:bg-white/15 transition-colors disabled:opacity-25"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="font-mono text-sm text-dark-text/55 px-2 min-w-[52px] text-center">
              {idx + 1} / {slides.length}
            </span>

            {hasTimer && <TimerWidget minutes={slide.timerMinutes!} slideId={slide.id} />}

            <button
              onClick={goNext}
              disabled={idx === slides.length - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/8 text-dark-text/70 hover:text-dark-text hover:bg-white/15 transition-colors disabled:opacity-25"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Droite : notes, miniatures, fullscreen */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPresenterMode((v) => !v)}
              title="Notes présentateur (P)"
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                presenterMode ? 'bg-accent/20 text-accent' : 'bg-white/8 text-dark-text/60 hover:text-accent hover:bg-white/15'
              )}
            >
              <FileText size={14} />
            </button>
            <button
              onClick={() => setShowThumbs((v) => !v)}
              title="Miniatures (T)"
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg transition-colors',
                showThumbs ? 'bg-accent/20 text-accent' : 'bg-white/8 text-dark-text/60 hover:text-accent hover:bg-white/15'
              )}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={toggleFullscreen}
              title="Plein écran (F)"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/8 text-dark-text/60 hover:text-accent hover:bg-white/15 transition-colors"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Raccourcis clavier (info, fade après 4s) ── */}
      <KeyboardHint />

      {/* ── Copyright watermark ── */}
      <div className="absolute bottom-16 right-4 text-[10px] text-white/15 pointer-events-none select-none font-inter tracking-wide z-30">
        © CHRIST J.
      </div>

      {/* ── Modal live (démarrer une session depuis la présentation) ── */}
      <AnimatePresence>
        {showLiveModal && (
          <LiveModal
            moduleId={moduleId}
            moduleTitle={moduleTitle}
            onClose={() => setShowLiveModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Hints clavier (affiché 4s au chargement) ── */
function KeyboardHint() {
  const [visible, setVisible] = useState(true)
  useEffect(() => { const id = setTimeout(() => setVisible(false), 4000); return () => clearTimeout(id) }, [])
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}
          className="absolute top-4 right-4 z-50 bg-dark-surface/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/8"
        >
          <p className="text-[10px] text-dark-text/50 space-y-0.5">
            {[['← →', 'Navigation'], ['F', 'Plein écran'], ['P', 'Notes'], ['T', 'Miniatures']].map(([k, v]) => (
              <span key={k} className="flex items-center gap-2">
                <kbd className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[9px]">{k}</kbd>
                <span>{v}</span>
              </span>
            ))}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
