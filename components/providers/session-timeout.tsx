'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, LogOut, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

const TIMEOUT_MS   = 30 * 60 * 1000   // 30 min
const WARNING_MS   = 25 * 60 * 1000   // avertissement à 25 min
const EVENTS       = ['mousemove', 'click', 'keypress', 'scroll', 'touchstart'] as const

function formatTime(ms: number) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const [showWarning, setShowWarning] = useState(false)
  const [remaining, setRemaining]     = useState(TIMEOUT_MS - WARNING_MS)
  const lastActivity = useRef(Date.now())
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const resetTimers = useCallback(() => {
    lastActivity.current = Date.now()
    setShowWarning(false)
    setRemaining(TIMEOUT_MS - WARNING_MS)

    if (warningTimer.current) clearTimeout(warningTimer.current)
    if (logoutTimer.current)  clearTimeout(logoutTimer.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    warningTimer.current = setTimeout(() => {
      setShowWarning(true)
      const deadline = Date.now() + (TIMEOUT_MS - WARNING_MS)

      countdownRef.current = setInterval(() => {
        const left = Math.max(0, deadline - Date.now())
        setRemaining(left)
        if (left === 0) {
          clearInterval(countdownRef.current!)
        }
      }, 1000)
    }, WARNING_MS)

    logoutTimer.current = setTimeout(() => {
      signOut({ callbackUrl: '/login' })
    }, TIMEOUT_MS)
  }, [])

  useEffect(() => {
    resetTimers()
    const handler = () => { if (!showWarning) resetTimers() }
    EVENTS.forEach((e) => window.addEventListener(e, handler, { passive: true }))
    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, handler))
      if (warningTimer.current) clearTimeout(warningTimer.current)
      if (logoutTimer.current)  clearTimeout(logoutTimer.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStayConnected = () => resetTimers()
  const handleLogout = () => signOut({ callbackUrl: '/login' })

  return (
    <>
      {children}

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ duration: 0.25 }}
              className="bg-dark-surface border border-dark-text/12 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center"
            >
              {/* Icône animée */}
              <div className="w-16 h-16 rounded-2xl bg-amber-500/12 text-amber-400 flex items-center justify-center mx-auto mb-5">
                <Clock size={28} />
              </div>

              <h2 className="font-syne text-xl font-bold text-dark-text mb-2">
                Session sur le point d&apos;expirer
              </h2>
              <p className="text-dark-text/55 text-sm mb-5 leading-relaxed">
                Vous serez déconnecté automatiquement dans
              </p>

              {/* Compte à rebours */}
              <div className="font-mono text-4xl font-bold text-amber-400 mb-6 tabular-nums">
                {formatTime(remaining)}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={handleStayConnected}
                >
                  <RefreshCw size={15} />
                  Rester connecté
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={handleLogout}
                  className="text-dark-text/55 hover:text-red-400"
                >
                  <LogOut size={15} />
                  Quitter
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
