'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Upload, FileText, Image, Presentation,
  Loader2, CheckCircle2, AlertCircle, Replace, PlusCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { SlideWithContent } from '@/types/slides'

const ACCEPTED = [
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/pdf',
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
]

const ACCEPT_ATTR = '.pptx,.pdf,.jpg,.jpeg,.png,.webp,.gif'

function fileIcon(file: File) {
  if (file.type.includes('presentation') || file.name.endsWith('.pptx'))
    return <Presentation size={20} className="text-or" />
  if (file.type === 'application/pdf')
    return <FileText size={20} className="text-red-400" />
  return <Image size={20} className="text-accent" />
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`
}

interface Props {
  moduleId: string
  onSuccess: (slides: SlideWithContent[], mode: 'append' | 'replace') => void
  onClose: () => void
}

type Step = 'pick' | 'options' | 'importing' | 'done'

export function ImportModal({ moduleId, onSuccess, onClose }: Props) {
  const [file, setFile]         = useState<File | null>(null)
  const [mode, setMode]         = useState<'append' | 'replace'>('append')
  const [step, setStep]         = useState<Step>('pick')
  const [dragOver, setDragOver] = useState(false)
  const [result, setResult]     = useState<{ imported: number } | null>(null)
  const [error, setError]       = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED.includes(f.type) && !f.name.toLowerCase().endsWith('.pptx')) {
      return 'Format non supporté. Utilisez .pptx, .pdf ou une image.'
    }
    if (f.size > 50 * 1024 * 1024) return 'Fichier trop volumineux (max 50 Mo).'
    return null
  }, [])

  const handleFileSelect = useCallback((f: File) => {
    const err = validateFile(f)
    if (err) { toast.error(err); return }
    setFile(f)
    setStep('options')
    setError('')
  }, [validateFile])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }

  const handleImport = async () => {
    if (!file) return
    setStep('importing')
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('mode', mode)

    try {
      const res  = await fetch(`/api/modules/${moduleId}/import`, { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Erreur inconnue')

      setResult({ imported: data.imported })
      setStep('done')
      onSuccess(data.slides as SlideWithContent[], mode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('options')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== 'importing' ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-text/10 dark:border-dark-text/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-light-text/8 dark:border-dark-text/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
              <Upload size={15} className="text-accent" />
            </div>
            <h2 className="font-syne font-bold text-light-text dark:text-dark-text">
              Importer une présentation
            </h2>
          </div>
          {step !== 'importing' && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/8 dark:hover:bg-dark-text/8 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* ── Étape 1 : choix du fichier ── */}
            {step === 'pick' && (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
                    dragOver
                      ? 'border-accent bg-accent/5'
                      : 'border-light-text/15 dark:border-dark-text/15 hover:border-accent/50 hover:bg-light-text/3 dark:hover:bg-dark-text/3'
                  }`}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
                  />
                  <Upload size={28} className="mx-auto mb-3 text-light-text/30 dark:text-dark-text/30" />
                  <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">
                    Glissez un fichier ici
                  </p>
                  <p className="text-xs text-light-text/45 dark:text-dark-text/45 mb-4">ou cliquez pour sélectionner</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {[
                      { icon: <Presentation size={13} />, label: 'PowerPoint', color: 'text-or' },
                      { icon: <FileText size={13} />, label: 'PDF', color: 'text-red-400' },
                      { icon: <Image size={13} />, label: 'Image', color: 'text-accent' },
                    ].map(({ icon, label, color }) => (
                      <span key={label} className={`flex items-center gap-1 text-xs ${color} bg-light-text/5 dark:bg-dark-text/5 px-2.5 py-1 rounded-lg`}>
                        {icon} {label}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-center text-[11px] text-light-text/30 dark:text-dark-text/30 mt-4">
                  © CHRIST J. — Formats : .pptx · .pdf · .jpg · .png · .webp
                </p>
              </motion.div>
            )}

            {/* ── Étape 2 : options ── */}
            {step === 'options' && file && (
              <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {/* Fichier sélectionné */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-light-text/4 dark:bg-dark-text/4 border border-light-text/8 dark:border-dark-text/8">
                  {fileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{file.name}</p>
                    <p className="text-xs text-light-text/45 dark:text-dark-text/45">{formatSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setStep('pick') }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-light-text/40 dark:text-dark-text/40 hover:text-light-text dark:hover:text-dark-text hover:bg-light-text/8 dark:hover:bg-dark-text/8 transition-colors flex-shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-light-text/60 dark:text-dark-text/60 uppercase tracking-wide">
                    Mode d&apos;import
                  </p>
                  {[
                    {
                      value: 'append' as const,
                      icon: <PlusCircle size={15} />,
                      label: 'Ajouter après les slides existantes',
                      desc: 'Les slides actuelles sont conservées.',
                    },
                    {
                      value: 'replace' as const,
                      icon: <Replace size={15} />,
                      label: 'Remplacer toutes les slides',
                      desc: 'Les slides actuelles seront supprimées.',
                      warn: true,
                    },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setMode(opt.value)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-colors ${
                        mode === opt.value
                          ? opt.warn
                            ? 'border-red-500/40 bg-red-500/6'
                            : 'border-accent/40 bg-accent/6'
                          : 'border-light-text/10 dark:border-dark-text/10 hover:border-light-text/20 dark:hover:border-dark-text/20'
                      }`}
                    >
                      <span className={`mt-0.5 flex-shrink-0 ${mode === opt.value ? (opt.warn ? 'text-red-400' : 'text-accent') : 'text-light-text/40 dark:text-dark-text/40'}`}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className={`text-sm font-medium ${mode === opt.value ? (opt.warn ? 'text-red-400' : 'text-accent') : 'text-light-text dark:text-dark-text'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-light-text/45 dark:text-dark-text/45 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
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

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={onClose}>
                    Annuler
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={handleImport}>
                    <Upload size={13} />
                    Importer
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Étape 3 : import en cours ── */}
            {step === 'importing' && (
              <motion.div key="importing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4 py-10"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Loader2 size={24} className="text-accent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-syne font-semibold text-light-text dark:text-dark-text mb-1">Import en cours…</p>
                  <p className="text-sm text-light-text/45 dark:text-dark-text/45">
                    Lecture et extraction des slides depuis <span className="font-medium">{file?.name}</span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Étape 4 : succès ── */}
            {step === 'done' && result && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-10 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-accent" />
                </div>
                <div>
                  <p className="font-syne font-bold text-xl text-light-text dark:text-dark-text mb-1">
                    Import terminé !
                  </p>
                  <p className="text-sm text-light-text/55 dark:text-dark-text/55">
                    <span className="text-accent font-semibold">{result.imported}</span> slide{result.imported !== 1 ? 's' : ''} importée{result.imported !== 1 ? 's' : ''} avec succès.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={onClose}>Fermer</Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
