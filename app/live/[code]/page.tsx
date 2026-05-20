'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Users, Wifi, WifiOff, Link as LinkIcon } from 'lucide-react'
import { SlideRenderer } from '@/components/slides/slide-renderer'
import type { SlideWithContent } from '@/types/slides'
import Link from 'next/link'

/* ── Types ── */
interface LiveState {
  currentSlideIndex: number
  isBlurred: boolean
  isBlackScreen: boolean
  isActive: boolean
  viewerCount: number
}

interface SessionData {
  code: string
  moduleTitle: string
  moduleId: string
  totalSlides: number
  slides: SlideWithContent[]
  currentSlideIndex: number
  isActive: boolean
  isBlurred: boolean
  isBlackScreen: boolean
  viewerCount: number
}

/* ── Écrans d'état ── */
function WaitingScreen({ code }: { code: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Zap size={32} className="text-accent" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-light text-white mb-2">En attente du formateur…</h2>
        <p className="text-text-secondary text-sm">La présentation démarrera automatiquement</p>
      </div>
      <div className="px-5 py-3 rounded-xl bg-dark-surface border border-dark-border">
        <p className="text-xs text-text-secondary mb-1">Code de session</p>
        <p className="font-mono text-xl font-bold text-accent tracking-widest">{code}</p>
      </div>
    </div>
  )
}

function EndedScreen({ moduleId }: { moduleId: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-or/10 flex items-center justify-center">
        <Zap size={32} className="text-or" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-light text-white mb-2">Présentation terminée</h2>
        <p className="text-text-secondary text-sm mb-1">Merci d'avoir participé à cette session.</p>
        <p className="text-text-muted text-xs">© CHRIST J. — DeckTrain</p>
      </div>
      <Link
        href={`/exercises/${moduleId}`}
        className="px-6 py-3 rounded-xl bg-accent text-[#111] text-sm font-semibold hover:bg-accent-dark transition-colors"
      >
        Voir les exercices du module
      </Link>
    </div>
  )
}

function BlackScreen() {
  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-white/40 text-sm font-inter"
      >
        Pause en cours…
      </motion.p>
    </div>
  )
}

function BlurOverlay() {
  return (
    <div className="absolute inset-0 backdrop-blur-xl bg-dark-bg/50 flex items-center justify-center z-10">
      <motion.p
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-white/60 text-sm font-inter"
      >
        Préparation en cours…
      </motion.p>
    </div>
  )
}

/* ── Composant principal ── */
export default function LiveParticipantPage({ params }: { params: { code: string } }) {
  const { code } = params

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [liveState, setLiveState]     = useState<LiveState | null>(null)
  const [status, setStatus]           = useState<'loading' | 'active' | 'ended' | 'not-found'>('loading')
  const [connected, setConnected]     = useState(false)

  const esRef  = useRef<EventSource | null>(null)
  const retries = useRef(0)

  // Charger les données initiales (slides + état)
  useEffect(() => {
    fetch(`/api/live/${code}`)
      .then((r) => {
        if (r.status === 404) { setStatus('not-found'); return null }
        return r.json()
      })
      .then((data: SessionData | null) => {
        if (!data) return
        setSessionData(data)
        setLiveState({
          currentSlideIndex: data.currentSlideIndex,
          isBlurred:         data.isBlurred,
          isBlackScreen:     data.isBlackScreen,
          isActive:          data.isActive,
          viewerCount:       data.viewerCount,
        })
        if (!data.isActive) { setStatus('ended'); return }
        setStatus('active')
      })
      .catch(() => setStatus('not-found'))
  }, [code])

  // Connexion SSE avec reconnexion automatique
  const connectSSE = useCallback(() => {
    if (esRef.current) esRef.current.close()

    const es = new EventSource(`/api/live/${code}/stream`)
    esRef.current = es

    es.addEventListener('init', () => {
      setConnected(true)
      retries.current = 0
    })

    es.addEventListener('state', (e) => {
      const state = JSON.parse(e.data) as LiveState
      setLiveState(state)
      setConnected(true)
    })

    es.addEventListener('ended', () => {
      setStatus('ended')
      setConnected(false)
      es.close()
    })

    es.addEventListener('error', () => {
      setConnected(false)
      es.close()
      // Reconnexion exponentielle plafonnée à 10s
      const delay = Math.min(1000 * 2 ** retries.current, 10000)
      retries.current++
      setTimeout(connectSSE, delay)
    })
  }, [code])

  useEffect(() => {
    if (status !== 'active') return
    connectSSE()
    return () => { esRef.current?.close() }
  }, [status, connectSSE])

  /* ── Rendu ── */
  const slide = sessionData?.slides[liveState?.currentSlideIndex ?? 0] ?? null
  const progress = sessionData && liveState
    ? ((liveState.currentSlideIndex + 1) / sessionData.totalSlides) * 100
    : 0

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-center px-6 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <LinkIcon size={24} className="text-red-400" />
        </div>
        <h2 className="font-display text-2xl font-light text-white">Session introuvable</h2>
        <p className="text-text-secondary text-sm">Ce code de session est invalide ou a expiré.</p>
        <p className="text-xs text-text-muted">© CHRIST J. — DeckTrain</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col text-dark-text overflow-hidden">
      {/* ── Barre de progression ── */}
      <div className="h-1 bg-white/8 fixed top-0 left-0 right-0 z-50">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* ── Header ── */}
      <header className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-surface/80 backdrop-blur-sm border border-dark-border/50">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-xs text-dark-text/60">{code}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {liveState && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-dark-surface/80 backdrop-blur-sm border border-dark-border/50">
              <Users size={10} className="text-dark-text/40" />
              <span className="text-xs text-dark-text/50">{liveState.viewerCount}</span>
            </div>
          )}
          <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-dark-surface/80 backdrop-blur-sm border border-dark-border/50">
            {connected
              ? <Wifi size={11} className="text-accent" />
              : <WifiOff size={11} className="text-red-400 animate-pulse" />
            }
          </div>
        </div>
      </header>

      {/* ── Zone principale ── */}
      <main className="flex-1 flex items-center justify-center pt-10 pb-8 relative">
        <AnimatePresence mode="wait">
          {status === 'ended' && sessionData ? (
            <motion.div key="ended" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <EndedScreen moduleId={sessionData.moduleId} />
            </motion.div>
          ) : !slide ? (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <WaitingScreen code={code} />
            </motion.div>
          ) : (
            <motion.div
              key={liveState?.currentSlideIndex ?? 0}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto px-4 relative"
            >
              {/* Ratio 16/9 pour la slide */}
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <div className="absolute inset-0 rounded-2xl overflow-hidden border border-dark-border shadow-2xl bg-dark-surface">
                  <SlideRenderer slide={slide} />

                  {/* Overlay flou */}
                  <AnimatePresence>
                    {liveState?.isBlurred && (
                      <motion.div
                        key="blur"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0"
                      >
                        <BlurOverlay />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Écran noir */}
                  <AnimatePresence>
                    {liveState?.isBlackScreen && (
                      <motion.div
                        key="black"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0"
                      >
                        <BlackScreen />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Compteur de slide */}
              <div className="mt-3 flex items-center justify-between px-1">
                <p className="text-xs text-dark-text/30 font-mono">
                  {(liveState?.currentSlideIndex ?? 0) + 1} / {sessionData?.totalSlides ?? 1}
                </p>
                <p className="text-xs text-dark-text/20">Lecture seule · DeckTrain</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="py-3 text-center flex-shrink-0">
        <p className="text-[10px] text-dark-text/20 label-dt">© CHRIST J. — DeckTrain</p>
      </footer>
    </div>
  )
}
