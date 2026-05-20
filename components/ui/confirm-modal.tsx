'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  details?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  details,
  confirmLabel = 'Confirmer',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmModalProps) {
  const [countdown, setCountdown] = useState(3)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3)
      setReady(false)
      return
    }
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setReady(true)
    }
  }, [isOpen, countdown])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-red-500/10 rounded-xl flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-light-text dark:text-dark-text mb-1">
                  {title}
                </h3>
                <p className="text-light-text-muted dark:text-text-secondary text-sm leading-relaxed">
                  {message}
                </p>
                {details && (
                  <p className="text-red-400/80 text-xs mt-2 bg-red-500/6 border border-red-500/20 rounded-lg p-2 leading-relaxed">
                    {details}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-light-border dark:border-dark-border text-light-text-muted dark:text-text-secondary text-sm font-medium hover:border-accent hover:text-accent transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={ready ? onConfirm : undefined}
                disabled={!ready}
                className={[
                  'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  ready
                    ? 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                    : 'bg-red-500/25 text-red-300/60 cursor-not-allowed',
                ].join(' ')}
              >
                {ready ? confirmLabel : `Attendre ${countdown}s…`}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
