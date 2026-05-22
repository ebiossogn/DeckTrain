'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Rnd } from 'react-rnd'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Undo2, Redo2, Type, ImageIcon, Square, Star, Code2, Minus,
  Save, X, Grid3x3, Copy, Trash2, ChevronUp, ChevronDown,
  Lock, Unlock, Layers, Loader2, Zap,
} from 'lucide-react'
import type { SlideCanvas, SlideElement, SlideBackground } from '@/types/slides'
import { ElementRenderer, ICON_NAMES } from './element-renderer'
import { ElementProperties } from './element-properties'
import { SlideProperties } from './slide-properties'
import { SLIDE_TEMPLATES } from '@/lib/slide-templates'
import { getDefaultProps, DEFAULT_ELEMENT_SIZES } from '@/lib/slide-element-defaults'
import { cn } from '@/lib/utils'

// Ratio de référence 16:9 — les % stockés sont basés sur ces dimensions logiques
const LOGICAL_W = 960
const LOGICAL_H = 540

const ELEMENT_BTNS: { type: SlideElement['type']; icon: React.ElementType; label: string }[] = [
  { type: 'text',  icon: Type,       label: 'Texte'  },
  { type: 'image', icon: ImageIcon,  label: 'Image'  },
  { type: 'shape', icon: Square,     label: 'Forme'  },
  { type: 'icon',  icon: Star,       label: 'Icône'  },
  { type: 'code',  icon: Code2,      label: 'Code'   },
  { type: 'line',  icon: Minus,      label: 'Ligne'  },
]

interface Props {
  slide: SlideCanvas
  onSave: (canvas: SlideCanvas) => Promise<void>
  onClose: () => void
}

interface CanvasDims { width: number; height: number }

export function SlideEditorCanvas({ slide, onSave, onClose }: Props) {
  const [elements, setElements]           = useState<SlideElement[]>(slide.elements ?? [])
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [background, setBackground]       = useState<SlideBackground>(
    slide.background ?? { type: 'color', value: '#111111' }
  )
  const [history, setHistory]     = useState<SlideElement[][]>([[...(slide.elements ?? [])]])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [showGrid, setShowGrid]   = useState(false)
  const [isSaving, setIsSaving]   = useState(false)

  // Canvas affiché en vraies pixels (pas de transform scale)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState<CanvasDims>({ width: 800, height: 450 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const calc = () => {
      const { width, height } = el.getBoundingClientRect()
      const pad = 48
      const aspect = LOGICAL_W / LOGICAL_H
      let w = width - pad
      let h = w / aspect
      if (h > height - pad) { h = height - pad; w = h * aspect }
      setDims({ width: Math.floor(w), height: Math.floor(h) })
    }
    calc()
    const obs = new ResizeObserver(calc)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const selectedElement = elements.find(e => e.id === selectedId) ?? null

  // ── Histoire ──────────────────────────────────────────────────────────────
  const pushHistory = useCallback((els: SlideElement[]) => {
    setHistory(prev => {
      const base = prev.slice(0, historyIdx + 1)
      return [...base, [...els]]
    })
    setHistoryIdx(i => i + 1)
  }, [historyIdx])

  const undo = useCallback(() => {
    setHistoryIdx(i => {
      if (i <= 0) return i
      const next = i - 1
      setElements([...history[next]])
      setSelectedId(null)
      return next
    })
  }, [history])

  const redo = useCallback(() => {
    setHistoryIdx(i => {
      if (i >= history.length - 1) return i
      const next = i + 1
      setElements([...history[next]])
      return next
    })
  }, [history])

  // ── Conversion %  ↔  px ──────────────────────────────────────────────────
  const pctToPx = useCallback((pct: number, axis: 'x' | 'w') =>
    (pct / 100) * (axis === 'x' ? dims.width : dims.width), [dims])

  const pxToPct = useCallback((px: number, axis: 'x' | 'w') =>
    (px / (axis === 'x' ? dims.width : dims.width)) * 100, [dims])

  const elPx = useCallback((el: SlideElement) => ({
    x: (el.x      / 100) * dims.width,
    y: (el.y      / 100) * dims.height,
    w: (el.width  / 100) * dims.width,
    h: (el.height / 100) * dims.height,
  }), [dims])

  // ── CRUD éléments ─────────────────────────────────────────────────────────
  const addElement = useCallback((type: SlideElement['type'], iconName?: string) => {
    const { width, height } = DEFAULT_ELEMENT_SIZES[type]
    const newEl: SlideElement = {
      id: crypto.randomUUID(),
      type, rotation: 0, opacity: 1, locked: false,
      zIndex: elements.length + 1,
      x: 20, y: 25, width, height,
      props: getDefaultProps(type, iconName),
    }
    const next = [...elements, newEl]
    setElements(next)
    setSelectedId(newEl.id)
    pushHistory(next)
  }, [elements, pushHistory])

  const deleteElement = useCallback((id: string) => {
    const next = elements.filter(e => e.id !== id)
    setElements(next)
    setSelectedId(null)
    setEditingTextId(null)
    pushHistory(next)
  }, [elements, pushHistory])

  const duplicateElement = useCallback((id: string) => {
    const src = elements.find(e => e.id === id)
    if (!src) return
    const dup: SlideElement = {
      ...src,
      id: crypto.randomUUID(),
      x: Math.min(src.x + 3, 65),
      y: Math.min(src.y + 3, 65),
      zIndex: elements.length + 1,
    }
    const next = [...elements, dup]
    setElements(next)
    setSelectedId(dup.id)
    pushHistory(next)
  }, [elements, pushHistory])

  const updateElement = useCallback((id: string, patch: Partial<SlideElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el))
  }, [])

  const updateProps = useCallback((id: string, patch: Record<string, unknown>) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, props: { ...el.props, ...patch } } : el
    ))
  }, [])

  // Après chaque drag/resize, convertir les pixels en %
  const commitDrag = useCallback((id: string, x: number, y: number, w: number, h: number) => {
    const xPct = Math.max(0, (x / dims.width)  * 100)
    const yPct = Math.max(0, (y / dims.height) * 100)
    const wPct = (w / dims.width)  * 100
    const hPct = (h / dims.height) * 100
    setElements(prev => {
      const next = prev.map(el =>
        el.id === id ? { ...el, x: xPct, y: yPct, width: wPct, height: hPct } : el
      )
      // Snapshot pour undo après chaque drag
      setHistory(hist => {
        const base = hist.slice(0, historyIdx + 1)
        const result = [...base, [...next]]
        setHistoryIdx(result.length - 1)
        return result
      })
      return next
    })
  }, [dims, historyIdx])

  const bringForward = useCallback((id: string) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el)), [])

  const sendBackward = useCallback((id: string) =>
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: Math.max(1, el.zIndex - 1) } : el)), [])

  const applyTemplate = useCallback((tpl: typeof SLIDE_TEMPLATES[0]) => {
    const els = tpl.elements.map(e => ({ ...e, id: crypto.randomUUID() })) as SlideElement[]
    setElements(els)
    setBackground(tpl.background)
    setSelectedId(null)
    pushHistory(els)
  }, [pushHistory])

  const handleSave = async () => {
    setIsSaving(true)
    await onSave({ ...slide, elements, background })
    setIsSaving(false)
  }

  // ── Raccourcis clavier ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable) return
      if (e.key === 'Delete' || e.key === 'Backspace') { if (selectedId) deleteElement(selectedId); return }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); return }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateElement(selectedId); return }
      if (e.key === 'Escape') { setSelectedId(null); setEditingTextId(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, deleteElement, undo, redo, duplicateElement])

  const bgStyle =
    background.type === 'gradient'
      ? `linear-gradient(135deg, ${background.value}, ${background.gradientTo ?? '#00D4FF'})`
      : background.type === 'image'
      ? `url(${background.value}) center/cover no-repeat`
      : background.value

  return (
    <div className="fixed inset-0 z-[100] bg-[#1A1A1A] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOOLBAR ─────────────────────────────────────────────────────────── */}
      <div className="h-12 bg-[#1C1C1C] border-b border-[#2E2E2E] flex items-center px-4 gap-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 mr-3 flex-shrink-0">
          <Zap size={14} style={{ color: '#00D4FF' }} />
          <span className="font-bold text-sm text-white">Deck</span>
          <span className="font-bold text-sm" style={{ color: '#C8A96E' }}>Train</span>
        </div>

        <div className="flex gap-0.5 pr-3 mr-1 border-r border-[#2E2E2E]">
          <button onClick={undo} disabled={historyIdx === 0}
            className="p-2 rounded hover:bg-white/8 disabled:opacity-20 transition-colors"
            style={{ color: historyIdx === 0 ? '#444' : '#AAA' }} title="Annuler (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button onClick={redo} disabled={historyIdx >= history.length - 1}
            className="p-2 rounded hover:bg-white/8 disabled:opacity-20 transition-colors"
            style={{ color: historyIdx >= history.length - 1 ? '#444' : '#AAA' }} title="Refaire (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
        </div>

        <div className="flex gap-0.5 pr-3 mr-1 border-r border-[#2E2E2E]">
          {ELEMENT_BTNS.map(({ type, icon: Icon, label }) => (
            <button key={type} onClick={() => addElement(type)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-white/8 text-xs transition-colors"
              style={{ color: '#888' }}
              title={`Ajouter ${label}`}
              onMouseEnter={e => (e.currentTarget.style.color = '#FFF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#888')}>
              <Icon size={13} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        <button onClick={() => setShowGrid(g => !g)}
          className="p-2 rounded transition-colors"
          style={{ color: showGrid ? '#00D4FF' : '#555', background: showGrid ? 'rgba(0,212,255,0.1)' : 'transparent' }}
          title="Grille">
          <Grid3x3 size={14} />
        </button>

        <div className="flex-1" />

        <button onClick={handleSave} disabled={isSaving}
          className="flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: '#00D4FF', color: '#0A0A0A' }}>
          {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-colors hover:border-[#555]"
          style={{ borderColor: '#2E2E2E', color: '#666' }}>
          <X size={13} />
          Fermer
        </button>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR GAUCHE ──────────────────────────────────────────────── */}
        <div className="w-52 bg-[#1C1C1C] border-r border-[#2E2E2E] flex flex-col overflow-y-auto flex-shrink-0">

          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#C8A96E' }}>Templates</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SLIDE_TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)} title={tpl.name}
                  className="aspect-video rounded border text-[10px] font-mono flex items-center justify-center transition-colors"
                  style={{ background: tpl.background.value, borderColor: '#2E2E2E', color: 'rgba(255,255,255,0.5)' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#00D4FF')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2E2E2E')}>
                  {tpl.preview}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#C8A96E' }}>Éléments</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ELEMENT_BTNS.map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => addElement(type)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors group"
                  style={{ borderColor: '#2E2E2E' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.background = 'rgba(0,212,255,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2E2E2E'; e.currentTarget.style.background = 'transparent' }}>
                  <Icon size={14} style={{ color: '#555' }} />
                  <span className="text-[9px]" style={{ color: '#444' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#C8A96E' }}>Icônes</p>
            <div className="grid grid-cols-5 gap-0.5">
              {ICON_NAMES.slice(0, 25).map(name => (
                <button key={name} onClick={() => addElement('icon', name)} title={name}
                  className="p-1.5 rounded text-[9px] transition-colors"
                  style={{ color: '#444' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.background = 'rgba(0,212,255,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#444'; e.currentTarget.style.background = 'transparent' }}>
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Calques */}
          <div className="p-3 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#C8A96E' }}>
              Calques ({elements.length})
            </p>
            <div className="space-y-0.5">
              {[...elements].reverse().map(el => (
                <div key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer group"
                  style={{
                    background: selectedId === el.id ? 'rgba(0,212,255,0.08)' : 'transparent',
                    border: `1px solid ${selectedId === el.id ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                  }}>
                  <span className="text-[11px]">
                    {el.type === 'text' ? '🔤' : el.type === 'image' ? '🖼️' : el.type === 'shape' ? '⬛' : el.type === 'icon' ? '⭐' : el.type === 'code' ? '💻' : '—'}
                  </span>
                  <span className="flex-1 truncate text-[10px]" style={{ color: selectedId === el.id ? '#FFF' : '#666' }}>
                    {el.type === 'text'
                      ? (el.props as { content: string }).content.slice(0, 14)
                      : el.type === 'icon'
                      ? (el.props as { iconName: string }).iconName
                      : el.type}
                  </span>
                  {el.locked && <Lock size={8} style={{ color: '#444' }} />}
                  <button
                    onClick={e => { e.stopPropagation(); deleteElement(el.id) }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: '#F87171' }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CANVAS ZONE ─────────────────────────────────────────────────── */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden"
          style={{ background: '#232323' }}
          onClick={() => { setSelectedId(null); setEditingTextId(null) }}
        >
          {/* Fond pointillé */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* Canvas — taille en vrais pixels, zéro transform */}
          <div
            style={{
              width: dims.width,
              height: dims.height,
              background: bgStyle,
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              zIndex: 1,
            }}
            onClick={e => { if (e.target === e.currentTarget) { setSelectedId(null); setEditingTextId(null) } }}
          >
            {/* Grille interne */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px, transparent 1px)',
                backgroundSize: `${dims.width / 20}px ${dims.height / 12}px`,
              }} />
            )}

            {/* Éléments Rnd */}
            {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => {
              const px = elPx(el)
              const isSelected    = selectedId === el.id
              const isTextEditing = editingTextId === el.id

              return (
                <Rnd
                  key={el.id}
                  position={{ x: px.x, y: px.y }}
                  size={{ width: px.w, height: px.h }}
                  onDragStop={(_e, d) => commitDrag(el.id, d.x, d.y, px.w, px.h)}
                  onResizeStop={(_e, _dir, ref, _delta, pos) =>
                    commitDrag(el.id, pos.x, pos.y, ref.offsetWidth, ref.offsetHeight)
                  }
                  bounds="parent"
                  disableDragging={el.locked || isTextEditing}
                  enableResizing={!el.locked && !isTextEditing}
                  style={{
                    opacity: el.opacity,
                    zIndex: el.zIndex,
                    outline: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
                    outlineOffset: '1px',
                    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  }}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedId(el.id) }}
                  onDoubleClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    if (el.type === 'text') setEditingTextId(el.id)
                  }}
                >
                  {/* Contenu */}
                  <div style={{ width: '100%', height: '100%', pointerEvents: isSelected ? 'auto' : 'none' }}>
                    <ElementRenderer
                      element={el}
                      isEditing={isTextEditing}
                      onPropsChange={patch => updateProps(el.id, patch)}
                      onFinishEditing={() => setEditingTextId(null)}
                    />
                  </div>

                  {/* Mini-toolbar */}
                  {isSelected && !isTextEditing && (
                    <div
                      className="absolute flex items-center gap-0.5 rounded-lg px-1 py-1 shadow-xl"
                      style={{
                        top: -36, left: 0,
                        background: '#1C1C1C',
                        border: '1px solid #333',
                        zIndex: 9999,
                      }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      {el.type === 'text' && (
                        <MiniBtn icon={Type} title="Éditer" onClick={() => setEditingTextId(el.id)} />
                      )}
                      <MiniBtn icon={Copy}    title="Dupliquer (Ctrl+D)" onClick={() => duplicateElement(el.id)} />
                      <MiniBtn icon={el.locked ? Lock : Unlock} title={el.locked ? 'Déverrouiller' : 'Verrouiller'}
                        onClick={() => updateElement(el.id, { locked: !el.locked })} />
                      <MiniBtn icon={ChevronUp}   title="Avancer"  onClick={() => bringForward(el.id)} />
                      <MiniBtn icon={ChevronDown} title="Reculer"  onClick={() => sendBackward(el.id)} />
                      <div style={{ width: 1, height: 16, background: '#333', margin: '0 2px' }} />
                      <MiniBtn icon={Trash2} title="Supprimer (Suppr)" onClick={() => deleteElement(el.id)} danger />
                    </div>
                  )}
                </Rnd>
              )
            })}
          </div>
        </div>

        {/* ── SIDEBAR DROITE — Propriétés ─────────────────────────────────── */}
        <div className="w-64 bg-[#1C1C1C] border-l border-[#2E2E2E] overflow-y-auto flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedElement ? (
              <motion.div key={selectedElement.id}
                initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <ElementProperties
                  element={selectedElement}
                  onUpdate={patch => updateElement(selectedElement.id, patch)}
                  onUpdateProps={patch => updateProps(selectedElement.id, patch)}
                  onDelete={() => deleteElement(selectedElement.id)}
                />
              </motion.div>
            ) : (
              <motion.div key="slide-props"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
                <SlideProperties background={background} onBackgroundChange={setBackground} />
                {elements.length === 0 && (
                  <div className="mx-4 mt-2 p-3 rounded-xl text-center"
                    style={{ border: '1px dashed #2E2E2E' }}>
                    <Layers size={16} style={{ color: '#333', margin: '0 auto 6px' }} />
                    <p className="text-[10px] leading-relaxed" style={{ color: '#444' }}>
                      Cliquez sur un type d'élément pour l'ajouter au canvas
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <div className="h-7 flex items-center justify-between px-4 flex-shrink-0"
        style={{ background: '#1C1C1C', borderTop: '1px solid #2E2E2E' }}>
        <span className="text-[10px]" style={{ color: '#333' }}>© CHRIST J.</span>
        <span className="text-[10px] hidden sm:inline" style={{ color: '#333' }}>
          {elements.length} élément{elements.length !== 1 ? 's' : ''}
          {' · '}Suppr supprimer · Ctrl+Z annuler · Ctrl+D dupliquer · Double-clic éditer texte
        </span>
      </div>
    </div>
  )
}

function MiniBtn({
  icon: Icon, title, onClick, danger,
}: { icon: React.ElementType; title: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} title={title}
      className="p-1.5 rounded transition-colors"
      style={{ color: danger ? '#F87171' : '#777' }}
      onMouseEnter={e => { e.currentTarget.style.color = danger ? '#FCA5A5' : '#FFF'; e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.08)' }}
      onMouseLeave={e => { e.currentTarget.style.color = danger ? '#F87171' : '#777'; e.currentTarget.style.background = 'transparent' }}>
      <Icon size={12} />
    </button>
  )
}
