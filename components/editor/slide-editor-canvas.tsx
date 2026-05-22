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

const CANVAS_W = 960
const CANVAS_H = 540

const ELEMENT_BTNS: { type: SlideElement['type']; icon: React.ElementType; label: string }[] = [
  { type: 'text',  icon: Type,       label: 'Texte' },
  { type: 'image', icon: ImageIcon,  label: 'Image' },
  { type: 'shape', icon: Square,     label: 'Forme' },
  { type: 'icon',  icon: Star,       label: 'Icône' },
  { type: 'code',  icon: Code2,      label: 'Code' },
  { type: 'line',  icon: Minus,      label: 'Ligne' },
]

interface Props {
  slide: SlideCanvas
  onSave: (canvas: SlideCanvas) => Promise<void>
  onClose: () => void
}

export function SlideEditorCanvas({ slide, onSave, onClose }: Props) {
  const [elements, setElements] = useState<SlideElement[]>(slide.elements ?? [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [background, setBackground] = useState<SlideBackground>(
    slide.background ?? { type: 'color', value: '#111111' }
  )
  const [history, setHistory] = useState<SlideElement[][]>([slide.elements ?? []])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [canvasScale, setCanvasScale] = useState(0.7)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedElement = elements.find(el => el.id === selectedId) ?? null

  // Auto-scale canvas to fit container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const update = () => {
      const { width, height } = container.getBoundingClientRect()
      setCanvasScale(Math.min((width - 64) / CANVAS_W, (height - 64) / CANVAS_H))
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(container)
    return () => obs.disconnect()
  }, [])

  // History
  const pushHistory = useCallback((els: SlideElement[]) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, [...els]]
    })
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const idx = historyIndex - 1
      setHistoryIndex(idx)
      setElements([...history[idx]])
      setSelectedId(null)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const idx = historyIndex + 1
      setHistoryIndex(idx)
      setElements([...history[idx]])
    }
  }, [history, historyIndex])

  // Add element
  const addElement = useCallback((type: SlideElement['type'], iconName?: string) => {
    const sizes = DEFAULT_ELEMENT_SIZES[type]
    const newEl: SlideElement = {
      id: crypto.randomUUID(),
      type,
      x: 20, y: 25,
      width: sizes.width,
      height: sizes.height,
      rotation: 0,
      zIndex: elements.length + 1,
      opacity: 1,
      locked: false,
      props: getDefaultProps(type, iconName),
    }
    const next = [...elements, newEl]
    setElements(next)
    setSelectedId(newEl.id)
    pushHistory(next)
  }, [elements, pushHistory])

  const updatePosition = useCallback((id: string, x: number, y: number, w: number, h: number) => {
    setElements(prev => prev.map(el =>
      el.id === id ? {
        ...el,
        x: Math.max(0, (x / CANVAS_W) * 100),
        y: Math.max(0, (y / CANVAS_H) * 100),
        width: (w / CANVAS_W) * 100,
        height: (h / CANVAS_H) * 100,
      } : el
    ))
  }, [])

  const updateElement = useCallback((id: string, patch: Partial<SlideElement>) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...patch } : el))
  }, [])

  const updateProps = useCallback((id: string, patch: Record<string, unknown>) => {
    setElements(prev => prev.map(el =>
      el.id === id ? { ...el, props: { ...el.props, ...patch } } : el
    ))
  }, [])

  const deleteElement = useCallback((id: string) => {
    const next = elements.filter(el => el.id !== id)
    setElements(next)
    setSelectedId(null)
    setEditingTextId(null)
    pushHistory(next)
  }, [elements, pushHistory])

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id)
    if (!el) return
    const dup: SlideElement = {
      ...el,
      id: crypto.randomUUID(),
      x: Math.min(el.x + 3, 65),
      y: Math.min(el.y + 3, 65),
      zIndex: elements.length + 1,
    }
    const next = [...elements, dup]
    setElements(next)
    setSelectedId(dup.id)
    pushHistory(next)
  }, [elements, pushHistory])

  const bringForward = useCallback((id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: el.zIndex + 1 } : el))
  }, [])

  const sendBackward = useCallback((id: string) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, zIndex: Math.max(1, el.zIndex - 1) } : el))
  }, [])

  const applyTemplate = useCallback((tpl: typeof SLIDE_TEMPLATES[0]) => {
    const els = tpl.elements.map(el => ({ ...el, id: crypto.randomUUID() })) as SlideElement[]
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) deleteElement(selectedId)
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') { e.preventDefault(); if (selectedId) duplicateElement(selectedId) }
      if (e.key === 'Escape') { setSelectedId(null); setEditingTextId(null) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, deleteElement, undo, redo, duplicateElement])

  const bgStyle = background.type === 'color'
    ? background.value
    : background.type === 'gradient'
    ? `linear-gradient(135deg, ${background.value}, ${background.gradientTo ?? '#00D4FF'})`
    : `url(${background.value}) center/cover no-repeat`

  return (
    <div className="fixed inset-0 z-[100] bg-[#1A1A1A] flex flex-col font-sans">

      {/* ── TOOLBAR ── */}
      <div className="h-13 bg-[#1C1C1C] border-b border-[#2E2E2E] flex items-center px-4 gap-2 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-1.5 mr-3 flex-shrink-0">
          <Zap size={15} className="text-[#00D4FF]" />
          <span className="font-bold text-sm text-white">Deck</span>
          <span className="font-bold text-sm text-[#C8A96E]">Train</span>
        </div>

        {/* Undo / Redo */}
        <div className="flex gap-0.5 border-r border-[#2E2E2E] pr-3 mr-1">
          <button onClick={undo} disabled={historyIndex === 0}
            className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white disabled:opacity-20 transition-all"
            title="Annuler (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-white/8 text-white/50 hover:text-white disabled:opacity-20 transition-all"
            title="Refaire (Ctrl+Y)">
            <Redo2 size={14} />
          </button>
        </div>

        {/* Ajouter éléments */}
        <div className="flex gap-0.5 border-r border-[#2E2E2E] pr-3 mr-1">
          {ELEMENT_BTNS.map(({ type, icon: Icon, label }) => (
            <button key={type} onClick={() => addElement(type)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/8 text-white/50 hover:text-white text-xs transition-all"
              title={`Ajouter ${label}`}>
              <Icon size={13} />
              <span className="hidden lg:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Grille */}
        <button onClick={() => setShowGrid(g => !g)}
          className={cn('p-2 rounded-lg text-xs transition-all', showGrid ? 'text-[#00D4FF] bg-[#00D4FF]/10' : 'text-white/40 hover:text-white hover:bg-white/8')}
          title="Afficher/masquer la grille">
          <Grid3x3 size={14} />
        </button>

        <div className="flex-1" />

        {/* Scale info */}
        <span className="text-[10px] text-white/25 hidden xl:inline">
          {Math.round(canvasScale * 100)}%
        </span>

        {/* Save / Close */}
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-1.5 bg-[#00D4FF] text-[#0A0A0A] font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#00BBDD] disabled:opacity-50 transition-all">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </button>
          <button onClick={onClose}
            className="flex items-center gap-1.5 border border-[#2E2E2E] text-white/50 text-xs px-3 py-2 rounded-xl hover:border-[#444] hover:text-white transition-all">
            <X size={13} />
            Fermer
          </button>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR GAUCHE ── */}
        <div className="w-56 bg-[#1C1C1C] border-r border-[#2E2E2E] flex flex-col overflow-y-auto flex-shrink-0">

          {/* Templates */}
          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold text-[#C8A96E] uppercase tracking-wider mb-2">Templates</p>
            <div className="grid grid-cols-3 gap-1.5">
              {SLIDE_TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                  title={tpl.name}
                  className="aspect-video rounded-lg border border-[#2E2E2E] hover:border-[#00D4FF]/50 transition-all flex items-center justify-center text-xs text-white/40 hover:text-white/70 font-mono"
                  style={{ background: tpl.background.value }}>
                  {tpl.preview}
                </button>
              ))}
            </div>
          </div>

          {/* Éléments */}
          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold text-[#C8A96E] uppercase tracking-wider mb-2">Éléments</p>
            <div className="grid grid-cols-3 gap-1.5">
              {ELEMENT_BTNS.map(({ type, icon: Icon, label }) => (
                <button key={type} onClick={() => addElement(type)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl border border-[#2E2E2E] hover:border-[#00D4FF]/50 hover:bg-[#00D4FF]/5 transition-all group">
                  <Icon size={15} className="text-white/40 group-hover:text-[#00D4FF] transition-colors" />
                  <span className="text-[9px] text-white/35 group-hover:text-white/70">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icônes */}
          <div className="p-3 border-b border-[#2E2E2E]">
            <p className="text-[10px] font-semibold text-[#C8A96E] uppercase tracking-wider mb-2">Icônes</p>
            <div className="grid grid-cols-5 gap-1">
              {ICON_NAMES.slice(0, 30).map(name => (
                <button key={name} onClick={() => addElement('icon', name)}
                  title={name}
                  className="p-1.5 rounded-lg hover:bg-[#00D4FF]/10 hover:text-[#00D4FF] text-white/30 transition-all flex items-center justify-center">
                  <span className="text-[10px]">{name.slice(0, 2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Calques */}
          <div className="p-3 flex-1">
            <p className="text-[10px] font-semibold text-[#C8A96E] uppercase tracking-wider mb-2">
              Calques ({elements.length})
            </p>
            <div className="space-y-0.5">
              {[...elements].reverse().map(el => (
                <div key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer text-xs transition-all group',
                    selectedId === el.id
                      ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/25 text-white'
                      : 'hover:bg-white/5 border border-transparent text-white/45 hover:text-white/70'
                  )}>
                  <span className="text-[11px]">
                    {el.type === 'text' ? '🔤' : el.type === 'image' ? '🖼️' : el.type === 'shape' ? '⬛' : el.type === 'icon' ? '⭐' : el.type === 'code' ? '💻' : '—'}
                  </span>
                  <span className="flex-1 truncate">{
                    el.type === 'text' ? (el.props as { content: string }).content.slice(0, 16) :
                    el.type === 'icon' ? (el.props as { iconName: string }).iconName :
                    el.type
                  }</span>
                  {el.locked && <Lock size={9} className="text-white/30" />}
                  <button
                    onClick={e => { e.stopPropagation(); deleteElement(el.id) }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all">
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CANVAS ── */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#242424] flex items-center justify-center overflow-hidden relative"
          onClick={() => { setSelectedId(null); setEditingTextId(null) }}
        >
          {/* Grille de repère hors canvas */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas 16:9 */}
          <div
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              background: bgStyle,
              transform: `scale(${canvasScale})`,
              transformOrigin: 'center center',
              position: 'relative',
              flexShrink: 0,
              boxShadow: '0 25px 80px rgba(0,0,0,0.8)',
            }}
            onClick={e => { if (e.target === e.currentTarget) { setSelectedId(null); setEditingTextId(null) } }}
          >
            {/* Grille d'alignement interne */}
            {showGrid && (
              <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)',
                backgroundSize: '48px 27px',
              }} />
            )}

            {/* Éléments */}
            {[...elements].sort((a, b) => a.zIndex - b.zIndex).map(el => {
              const isSelected = selectedId === el.id
              const isTextEditing = editingTextId === el.id

              return (
                <Rnd
                  key={el.id}
                  scale={canvasScale}
                  position={{
                    x: (el.x / 100) * CANVAS_W,
                    y: (el.y / 100) * CANVAS_H,
                  }}
                  size={{
                    width: (el.width / 100) * CANVAS_W,
                    height: (el.height / 100) * CANVAS_H,
                  }}
                  onDragStop={(_e: unknown, d: { x: number; y: number }) => {
                    updatePosition(el.id, d.x, d.y, (el.width / 100) * CANVAS_W, (el.height / 100) * CANVAS_H)
                    pushHistory(elements)
                  }}
                  onResizeStop={(_e: unknown, _dir: unknown, ref: HTMLElement, _delta: unknown, pos: { x: number; y: number }) => {
                    updatePosition(el.id, pos.x, pos.y, parseFloat(ref.style.width), parseFloat(ref.style.height))
                    pushHistory(elements)
                  }}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedId(el.id) }}
                  onDoubleClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    if (el.type === 'text') setEditingTextId(el.id)
                  }}
                  bounds="parent"
                  disableDragging={el.locked || isTextEditing}
                  enableResizing={!el.locked && !isTextEditing}
                  style={{
                    opacity: el.opacity,
                    zIndex: el.zIndex,
                    outline: isSelected ? '2px solid #00D4FF' : '2px solid transparent',
                    outlineOffset: '1px',
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                >
                  <div className="w-full h-full">
                    <ElementRenderer
                      element={el}
                      isEditing={isTextEditing}
                      onPropsChange={patch => updateProps(el.id, patch)}
                      onFinishEditing={() => setEditingTextId(null)}
                    />
                  </div>

                  {/* Mini-toolbar au-dessus de l'élément sélectionné */}
                  {isSelected && !isTextEditing && (
                    <div
                      className="absolute -top-9 left-0 flex items-center gap-0.5 bg-[#1C1C1C] border border-[#333] rounded-lg px-1 py-1 shadow-xl"
                      style={{ zIndex: 9999 }}
                      onMouseDown={e => e.stopPropagation()}
                    >
                      {el.type === 'text' && (
                        <button onClick={() => setEditingTextId(el.id)}
                          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all"
                          title="Éditer le texte">
                          <Type size={11} />
                        </button>
                      )}
                      <button onClick={() => duplicateElement(el.id)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Dupliquer (Ctrl+D)">
                        <Copy size={11} />
                      </button>
                      <button onClick={() => updateElement(el.id, { locked: !el.locked })}
                        className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title={el.locked ? 'Déverrouiller' : 'Verrouiller'}>
                        {el.locked ? <Lock size={11} /> : <Unlock size={11} />}
                      </button>
                      <button onClick={() => bringForward(el.id)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Avancer">
                        <ChevronUp size={11} />
                      </button>
                      <button onClick={() => sendBackward(el.id)}
                        className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white transition-all"
                        title="Reculer">
                        <ChevronDown size={11} />
                      </button>
                      <div className="w-px h-4 bg-white/10 mx-0.5" />
                      <button onClick={() => deleteElement(el.id)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                        title="Supprimer (Suppr)">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </Rnd>
              )
            })}
          </div>
        </div>

        {/* ── SIDEBAR DROITE — Propriétés ── */}
        <div className="w-64 bg-[#1C1C1C] border-l border-[#2E2E2E] overflow-y-auto flex-shrink-0">
          <AnimatePresence mode="wait">
            {selectedElement ? (
              <motion.div
                key={selectedElement.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <ElementProperties
                  element={selectedElement}
                  onUpdate={patch => updateElement(selectedElement.id, patch)}
                  onUpdateProps={patch => updateProps(selectedElement.id, patch)}
                  onDelete={() => deleteElement(selectedElement.id)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="slide-props"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <SlideProperties background={background} onBackgroundChange={setBackground} />
                {elements.length === 0 && (
                  <div className="mx-4 mt-2 p-3 rounded-xl border border-dashed border-[#2E2E2E] text-center">
                    <Layers size={18} className="text-white/20 mx-auto mb-2" />
                    <p className="text-[10px] text-white/30 leading-relaxed">
                      Ajoutez des éléments depuis la sidebar gauche ou les boutons de la toolbar
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="h-8 bg-[#1C1C1C] border-t border-[#2E2E2E] flex items-center justify-between px-4 flex-shrink-0">
        <span className="text-[10px] text-white/20">© CHRIST J.</span>
        <div className="flex items-center gap-3 text-[10px] text-white/25">
          <span>{elements.length} élément{elements.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Ctrl+Z annuler · Ctrl+D dupliquer · Suppr supprimer</span>
        </div>
      </div>
    </div>
  )
}
