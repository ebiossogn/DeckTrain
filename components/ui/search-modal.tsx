'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ArrowRight, BookOpen, PenTool, BarChart2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

type SearchResult = {
  type: string
  id: string
  title: string
  subtitle: string
  icon: string
  link: string
}

const QUICK_LINKS = [
  { icon: BookOpen,  label: 'Modules',   link: '/admin/modules' },
  { icon: PenTool,   label: 'Exercices', link: '/admin/exercises' },
  { icon: BarChart2, label: 'Sondages',  link: '/admin/surveys' },
]

const RESULT_ICONS: Record<string, React.ElementType> = {
  module:   BookOpen,
  exercise: PenTool,
  survey:   BarChart2,
}

export function SearchModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const open = useCallback(() => {
    setIsOpen(true)
    setQuery('')
    setResults([])
    setSelected(0)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const navigate = useCallback((link: string) => {
    router.push(link)
    close()
  }, [router, close])

  // Raccourci Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  // Focus à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Recherche avec debounce 300ms
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results ?? [])
      } catch {}
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const max = results.length - 1
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, max)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) navigate(results[selected].link)
  }

  return (
    <>
      {/* Bouton trigger dans la sidebar */}
      <button
        onClick={open}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl border border-light-text/10 dark:border-dark-text/10 text-light-text-secondary dark:text-text-secondary hover:border-accent/40 hover:text-light-text dark:hover:text-dark-text transition-all text-sm"
      >
        <Search size={14} className="flex-shrink-0" />
        <span className="flex-1 text-left">Rechercher...</span>
        <kbd className="text-[10px] font-mono bg-light-text/5 dark:bg-dark-text/5 px-1.5 py-0.5 rounded border border-light-text/10 dark:border-dark-text/10 flex-shrink-0">
          Ctrl+K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 bg-black/65 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -16 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-4 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Barre de recherche */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-light-border dark:border-dark-border">
                <Search size={18} className="text-light-text/40 dark:text-dark-text/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelected(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher modules, exercices, sondages..."
                  className="flex-1 bg-transparent text-light-text dark:text-dark-text outline-none text-base placeholder:text-light-text/30 dark:placeholder:text-dark-text/30"
                />
                {loading && (
                  <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin flex-shrink-0" />
                )}
                <button onClick={close} className="flex-shrink-0 text-light-text/35 dark:text-dark-text/35 hover:text-light-text dark:hover:text-dark-text transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Contenu */}
              <div className="max-h-96 overflow-y-auto">
                {/* Accès rapide (quand pas de query) */}
                {!query && (
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-light-text/35 dark:text-dark-text/35 mb-3">
                      Accès rapide
                    </p>
                    <div className="space-y-1">
                      {QUICK_LINKS.map(({ icon: Icon, label, link }) => (
                        <button
                          key={link}
                          onClick={() => navigate(link)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-light-text/5 dark:hover:bg-dark-text/5 text-left transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-accent/8 text-accent flex items-center justify-center flex-shrink-0">
                            <Icon size={14} />
                          </div>
                          <span className="text-sm text-light-text dark:text-dark-text font-medium flex-1">{label}</span>
                          <ArrowRight size={13} className="text-light-text/25 dark:text-dark-text/25 group-hover:text-accent transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aucun résultat */}
                {query.length >= 2 && !loading && results.length === 0 && (
                  <div className="py-12 text-center">
                    <p className="text-sm text-light-text/40 dark:text-dark-text/40">
                      Aucun résultat pour <span className="font-medium text-light-text dark:text-dark-text">"{query}"</span>
                    </p>
                  </div>
                )}

                {/* Résultats */}
                {results.length > 0 && (
                  <div className="py-2">
                    {results.map((result, idx) => {
                      const Icon = RESULT_ICONS[result.icon] ?? BookOpen
                      return (
                        <button
                          key={result.id}
                          onClick={() => navigate(result.link)}
                          onMouseEnter={() => setSelected(idx)}
                          className={cn(
                            'flex items-center gap-3 w-full px-4 py-3 text-left transition-colors',
                            selected === idx
                              ? 'bg-accent/8 border-l-2 border-accent pl-[14px]'
                              : 'hover:bg-light-text/4 dark:hover:bg-dark-text/4'
                          )}
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                            selected === idx ? 'bg-accent/15 text-accent' : 'bg-light-text/6 dark:bg-dark-text/6 text-light-text/50 dark:text-dark-text/50'
                          )}>
                            <Icon size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                              {result.title}
                            </p>
                            <p className="text-xs text-light-text/45 dark:text-dark-text/45 truncate mt-0.5">
                              {result.subtitle}
                            </p>
                          </div>
                          <ArrowRight size={13} className={cn(
                            'flex-shrink-0 transition-colors',
                            selected === idx ? 'text-accent' : 'text-light-text/20 dark:text-dark-text/20'
                          )} />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-light-border dark:border-dark-border text-[10px] text-light-text/30 dark:text-dark-text/30">
                <span><kbd className="font-mono">↑↓</kbd> Naviguer</span>
                <span><kbd className="font-mono">↵</kbd> Ouvrir</span>
                <span><kbd className="font-mono">Esc</kbd> Fermer</span>
                <span className="ml-auto">© CHRIST J.</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
