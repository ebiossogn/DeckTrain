'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, X, Check, Download, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { downloadCertificate } from '@/lib/generate-certificate'

interface Module {
  id: string
  title: string
}

interface IssueCertificateModalProps {
  participant: { id: string; name: string; email: string }
  modules: Module[]
  onClose: () => void
}

export function IssueCertificateModal({ participant, modules, onClose }: IssueCertificateModalProps) {
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [loading, setLoading] = useState(false)
  const [issued, setIssued] = useState<{
    code: string
    issuedAt: string
    issuedBy: string
    moduleTitle: string
  } | null>(null)

  const selectedModule = modules.find((m) => m.id === selectedModuleId)

  const handleIssue = async () => {
    if (!selectedModuleId) { toast.error('Sélectionnez un module'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: participant.id, moduleId: selectedModuleId }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          toast.error('Ce participant a déjà un certificat pour ce module')
        } else {
          toast.error(data.error ?? 'Erreur lors de l\'émission')
        }
        return
      }

      setIssued({
        code:        data.certificate.code,
        issuedAt:    data.certificate.issuedAt,
        issuedBy:    data.certificate.issuedBy,
        moduleTitle: data.certificate.module.title,
      })
      toast.success('Certificat émis avec succès')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!issued) return
    downloadCertificate({
      participantName: participant.name,
      moduleTitle:     issued.moduleTitle,
      issuedBy:        issued.issuedBy,
      issuedAt:        new Date(issued.issuedAt),
      code:            issued.code,
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
                <Award size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-light-text dark:text-dark-text">Émettre un certificat</p>
                <p className="text-xs text-light-text/45 dark:text-dark-text/45">{participant.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-light-text/35 dark:text-dark-text/35 hover:bg-light-text/8 dark:hover:bg-dark-text/8 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="px-6 py-5">
            {!issued ? (
              <>
                {/* Info participant */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-light-bg dark:bg-dark-bg mb-5">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{participant.name}</p>
                    <p className="text-xs text-light-text/40 dark:text-dark-text/40 truncate">{participant.email}</p>
                  </div>
                </div>

                {/* Sélection module */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-light-text/55 dark:text-dark-text/55 mb-2">
                    Module de formation *
                  </label>
                  {modules.length === 0 ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-400/6 border border-amber-400/20">
                      <AlertCircle size={14} className="text-amber-400 flex-shrink-0" />
                      <p className="text-xs text-amber-400">Aucun module disponible</p>
                    </div>
                  ) : (
                    <select
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      className="w-full text-sm bg-light-bg dark:bg-dark-bg border border-light-text/15 dark:border-dark-text/15 rounded-xl px-3 py-2.5 text-light-text dark:text-dark-text focus:outline-none focus:border-accent transition-colors"
                    >
                      <option value="">— Choisir un module —</option>
                      {modules.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Aperçu */}
                {selectedModule && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/15 mb-5 text-xs text-light-text/55 dark:text-dark-text/55"
                  >
                    Un certificat PDF sera généré pour{' '}
                    <span className="font-semibold text-light-text dark:text-dark-text">{participant.name}</span>
                    {' '}· formation{' '}
                    <span className="font-semibold text-light-text dark:text-dark-text">«&nbsp;{selectedModule.title}&nbsp;»</span>
                  </motion.div>
                )}

                <button
                  onClick={handleIssue}
                  disabled={!selectedModuleId || loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-dark-bg text-sm font-semibold hover:bg-amber-400/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-dark-bg/30 border-t-dark-bg animate-spin" />
                  ) : (
                    <Award size={15} />
                  )}
                  {loading ? 'Émission en cours…' : 'Émettre le certificat'}
                </button>
              </>
            ) : (
              /* Succès */
              <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center mb-4">
                    <Check size={26} />
                  </div>
                  <p className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
                    Certificat émis !
                  </p>
                  <p className="text-xs text-light-text/50 dark:text-dark-text/50">
                    Code de vérification
                  </p>
                  <p className="font-mono text-xl font-bold text-accent tracking-widest mt-1">
                    {issued.code}
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 text-dark-bg text-sm font-semibold hover:bg-amber-400/90 transition-colors"
                  >
                    <Download size={15} />
                    Télécharger le PDF
                  </button>
                  <a
                    href={`/verify/${issued.code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-light-text/12 dark:border-dark-text/12 text-light-text/60 dark:text-dark-text/60 text-sm hover:border-accent/30 hover:text-accent transition-colors"
                  >
                    <ExternalLink size={14} />
                    Voir la page de vérification
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
