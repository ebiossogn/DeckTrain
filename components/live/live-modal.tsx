'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  X, Radio, Copy, Check, Users, ExternalLink,
  Loader2, StopCircle, Monitor,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface LiveSession {
  code: string
  liveUrl: string
  viewerCount: number
}

interface LiveModalProps {
  moduleId: string
  moduleTitle: string
  onClose: () => void
}

export function LiveModal({ moduleId, moduleTitle, onClose }: LiveModalProps) {
  const [phase, setPhase]       = useState<'idle' | 'loading' | 'active' | 'ending'>('idle')
  const [session, setSession]   = useState<LiveSession | null>(null)
  const [viewers, setViewers]   = useState(0)
  const [copied, setCopied]     = useState<'link' | 'code' | null>(null)
  const [error, setError]       = useState('')

  // Créer la session live
  const startSession = async () => {
    setPhase('loading')
    setError('')
    try {
      const res = await fetch('/api/live/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Session déjà active pour ce formateur → récupérer le code
        if (res.status === 409 && data.code) {
          const base = window.location.origin
          setSession({ code: data.code, liveUrl: `${base}/live/${data.code}`, viewerCount: 0 })
          setPhase('active')
          return
        }
        setError(data.error ?? 'Erreur lors du lancement')
        setPhase('idle')
        return
      }
      setSession({ code: data.code, liveUrl: data.liveUrl, viewerCount: 0 })
      setPhase('active')
    } catch {
      setError('Erreur réseau')
      setPhase('idle')
    }
  }

  // Terminer la session
  const endSession = async () => {
    if (!session) return
    setPhase('ending')
    try {
      await fetch(`/api/live/${session.code}`, { method: 'DELETE' })
      toast.success('Session live terminée')
      onClose()
    } catch {
      toast.error('Erreur lors de la fermeture')
      setPhase('active')
    }
  }

  // Polling du compteur de participants (toutes les 5s)
  const pollViewers = useCallback(async () => {
    if (!session) return
    try {
      const res = await fetch(`/api/live/${session.code}`)
      if (res.ok) {
        const data = await res.json()
        setViewers(data.viewerCount ?? 0)
      }
    } catch { /* silencieux */ }
  }, [session])

  useEffect(() => {
    if (phase !== 'active' || !session) return
    pollViewers()
    const id = setInterval(pollViewers, 5000)
    return () => clearInterval(id)
  }, [phase, session, pollViewers])

  // Copier dans le presse-papier
  const copy = async (text: string, type: 'link' | 'code') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="bg-dark-surface border border-dark-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-red-400 animate-pulse" />
            <h2 className="font-syne font-semibold text-dark-text text-sm">Présentation live</h2>
          </div>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-dark-text/40 hover:text-dark-text transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* État initial */}
            {phase === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="rounded-xl bg-dark-bg border border-dark-border p-4">
                  <p className="text-xs text-dark-text/50 mb-1 label-dt">Module</p>
                  <p className="font-medium text-dark-text text-sm line-clamp-2">{moduleTitle}</p>
                </div>
                <p className="text-xs text-dark-text/50 leading-relaxed">
                  Un code unique sera généré. Les participants pourront suivre votre présentation en temps réel sur leur téléphone ou PC, sans compte.
                </p>
                {error && <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}
                <button
                  onClick={startSession}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                >
                  <Radio size={14} />
                  Lancer la présentation live
                </button>
              </motion.div>
            )}

            {/* Chargement */}
            {phase === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3 py-8">
                <Loader2 size={28} className="text-accent animate-spin" />
                <p className="text-sm text-dark-text/50">Création de la session…</p>
              </motion.div>
            )}

            {/* Session active */}
            {(phase === 'active' || phase === 'ending') && session && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                {/* Indicateur live */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Live en cours</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-dark-text/50">
                    <Users size={12} />
                    <span>{viewers} participant{viewers !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Code + QR */}
                <div className="bg-dark-bg rounded-xl border border-dark-border p-4 flex flex-col items-center gap-3">
                  <div className="p-2 bg-white rounded-xl">
                    <QRCodeSVG value={session.liveUrl} size={140} fgColor="#111111" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-dark-text/40 mb-1">Code de session</p>
                    <p className="font-mono text-2xl font-bold text-accent tracking-widest">{session.code}</p>
                  </div>
                </div>

                {/* Lien */}
                <div className="rounded-xl border border-dark-border bg-dark-bg px-3 py-2 flex items-center gap-2">
                  <span className="flex-1 text-xs text-dark-text/50 truncate font-mono">{session.liveUrl}</span>
                  <button
                    onClick={() => copy(session.liveUrl, 'link')}
                    className="flex items-center gap-1 text-xs text-accent hover:text-accent-dark transition-colors flex-shrink-0"
                  >
                    {copied === 'link' ? <Check size={12} /> : <Copy size={12} />}
                    {copied === 'link' ? 'Copié' : 'Copier'}
                  </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/present/${moduleId}?liveCode=${session.code}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-accent/30 bg-accent/8 text-accent text-xs font-semibold hover:bg-accent/15 transition-colors"
                  >
                    <Monitor size={13} />
                    Présenter
                  </Link>
                  <button
                    onClick={endSession}
                    disabled={phase === 'ending'}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 bg-red-500/8 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors disabled:opacity-50"
                  >
                    {phase === 'ending' ? <Loader2 size={13} className="animate-spin" /> : <StopCircle size={13} />}
                    Terminer
                  </button>
                </div>

                {/* Partager le lien */}
                <a
                  href={session.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs text-dark-text/40 hover:text-dark-text/70 transition-colors"
                >
                  <ExternalLink size={11} />
                  Ouvrir le lien participant dans un nouvel onglet
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 pb-4 text-center">
          <p className="text-[10px] text-dark-text/20 label-dt">© CHRIST J. — DeckTrain</p>
        </div>
      </motion.div>
    </motion.div>
  )
}
