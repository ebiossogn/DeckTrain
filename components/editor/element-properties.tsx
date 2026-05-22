'use client'

import type { SlideElement, TextProps, ImageProps, ShapeProps, IconProps, CodeProps, LineProps } from '@/types/slides'
import { ICON_NAMES } from './element-renderer'

interface Props {
  element: SlideElement
  onUpdate: (patch: Partial<SlideElement>) => void
  onUpdateProps: (patch: Record<string, unknown>) => void
  onDelete: () => void
}

const ELEMENT_TITLES: Record<SlideElement['type'], string> = {
  text: 'Texte', image: 'Image', shape: 'Forme',
  icon: 'Icône', code: 'Code', line: 'Ligne',
}

const FONT_FAMILIES = [
  { value: 'Syne, sans-serif', label: 'Syne' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Arial, sans-serif', label: 'Arial' },
]

const QUICK_COLORS = ['#FFFFFF', '#C8B89A', '#00D4FF', '#888888', '#111111', '#FF6B6B', '#4ECDC4', '#FFE66D']

export function ElementProperties({ element, onUpdate, onUpdateProps, onDelete }: Props) {
  const p = element.props as unknown as Record<string, unknown>

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#C8A96E] uppercase tracking-wider">
          {ELEMENT_TITLES[element.type]}
        </h3>
        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-all"
        >
          Supprimer
        </button>
      </div>

      {/* Position & Taille */}
      <div className="space-y-2">
        <p className="text-[10px] text-[#555] uppercase tracking-wider">Position & Taille</p>
        <div className="grid grid-cols-2 gap-2">
          {(['x', 'y', 'width', 'height'] as const).map(prop => (
            <div key={prop}>
              <label className="text-[10px] text-[#555] block mb-0.5">{prop.toUpperCase()} %</label>
              <input
                type="number" min={0} max={100} step={0.5}
                value={Math.round(element[prop] * 10) / 10}
                onChange={e => onUpdate({ [prop]: Number(e.target.value) } as Partial<SlideElement>)}
                className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1 text-xs text-[#CCC] focus:outline-none focus:border-[#00D4FF]/40"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Rotation */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555] uppercase tracking-wider">Rotation</label>
          <span className="text-[10px] text-[#666]">{element.rotation}°</span>
        </div>
        <input
          type="range" min={-180} max={180}
          value={element.rotation}
          onChange={e => onUpdate({ rotation: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]"
        />
      </div>

      {/* Opacité */}
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555] uppercase tracking-wider">Opacité</label>
          <span className="text-[10px] text-[#666]">{Math.round(element.opacity * 100)}%</span>
        </div>
        <input
          type="range" min={0} max={1} step={0.01}
          value={element.opacity}
          onChange={e => onUpdate({ opacity: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]"
        />
      </div>

      <div className="border-t border-[#2E2E2E]" />

      {/* Text props */}
      {element.type === 'text' && <TextPanel props={element.props as TextProps} onUpdate={onUpdateProps} />}

      {/* Image props */}
      {element.type === 'image' && <ImagePanel props={element.props as ImageProps} onUpdate={onUpdateProps} />}

      {/* Shape props */}
      {element.type === 'shape' && <ShapePanel props={element.props as ShapeProps} onUpdate={onUpdateProps} />}

      {/* Icon props */}
      {element.type === 'icon' && <IconPanel props={element.props as IconProps} onUpdate={onUpdateProps} />}

      {/* Code props */}
      {element.type === 'code' && <CodePanel props={element.props as CodeProps} onUpdate={onUpdateProps} />}

      {/* Line props */}
      {element.type === 'line' && <LinePanel props={element.props as LineProps} onUpdate={onUpdateProps} />}
    </div>
  )
}

function TextPanel({ props, onUpdate }: { props: TextProps; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Texte</p>

      <textarea
        value={props.content}
        onChange={e => onUpdate({ content: e.target.value })}
        rows={4}
        className="w-full bg-[#111] border border-[#2E2E2E] rounded-lg px-2 py-2 text-sm text-[#CCC] resize-none focus:outline-none focus:border-[#00D4FF]/40"
        placeholder="Votre texte…"
      />

      <div>
        <label className="text-[10px] text-[#555] block mb-1">Police</label>
        <select
          value={props.fontFamily}
          onChange={e => onUpdate({ fontFamily: e.target.value })}
          className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1.5 text-xs text-[#CCC] focus:outline-none"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Taille</label>
          <span className="text-[10px] text-[#666]">{props.fontSize}px</span>
        </div>
        <input
          type="range" min={8} max={200}
          value={props.fontSize}
          onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onUpdate({ fontWeight: props.fontWeight === 'bold' ? 'normal' : 'bold' })}
          className={`flex-1 py-1.5 rounded text-sm font-bold border transition-all ${props.fontWeight === 'bold' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}
        >
          G
        </button>
        <button
          onClick={() => onUpdate({ fontStyle: props.fontStyle === 'italic' ? 'normal' : 'italic' })}
          className={`flex-1 py-1.5 rounded text-sm italic border transition-all ${props.fontStyle === 'italic' ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}
        >
          I
        </button>
      </div>

      <div className="flex gap-1">
        {(['left', 'center', 'right'] as const).map(a => (
          <button
            key={a}
            onClick={() => onUpdate({ textAlign: a })}
            className={`flex-1 py-1.5 rounded text-xs border transition-all ${props.textAlign === a ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}
          >
            {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
          </button>
        ))}
      </div>

      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Couleur texte</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="color" value={props.color} onChange={e => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-[#2E2E2E] bg-transparent" />
          {QUICK_COLORS.map(c => (
            <button key={c} onClick={() => onUpdate({ color: c })}
              className={`w-5 h-5 rounded-full border transition-all hover:scale-110 ${props.color === c ? 'border-[#00D4FF]' : 'border-[#2E2E2E]'}`}
              style={{ background: c }} />
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Fond du texte</label>
        <div className="flex items-center gap-2">
          <input type="color"
            value={props.backgroundColor === 'transparent' ? '#000000' : props.backgroundColor}
            onChange={e => onUpdate({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-[#2E2E2E] bg-transparent" />
          <button onClick={() => onUpdate({ backgroundColor: 'transparent' })}
            className="text-xs text-[#666] border border-[#2E2E2E] rounded px-2 py-1 hover:border-[#444]">
            Sans
          </button>
          <input type="text"
            value={props.backgroundColor}
            onChange={e => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1 bg-[#111] border border-[#2E2E2E] rounded px-2 py-1 text-xs text-[#CCC] font-mono"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Interligne</label>
          <span className="text-[10px] text-[#666]">{props.lineHeight}</span>
        </div>
        <input type="range" min={0.8} max={3} step={0.1}
          value={props.lineHeight}
          onChange={e => onUpdate({ lineHeight: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Padding</label>
          <span className="text-[10px] text-[#666]">{props.padding}px</span>
        </div>
        <input type="range" min={0} max={48}
          value={props.padding}
          onChange={e => onUpdate({ padding: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>

      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Arrondi</label>
          <span className="text-[10px] text-[#666]">{props.borderRadius}px</span>
        </div>
        <input type="range" min={0} max={48}
          value={props.borderRadius}
          onChange={e => onUpdate({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>
    </div>
  )
}

function ImagePanel({ props, onUpdate }: { props: ImageProps; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Image</p>
      <div>
        <label className="text-[10px] text-[#555] block mb-1">URL de l'image</label>
        <input type="url" value={props.src} onChange={e => onUpdate({ src: e.target.value })}
          className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1.5 text-xs text-[#CCC] focus:outline-none focus:border-[#00D4FF]/40"
          placeholder="https://..." />
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1">Texte alternatif</label>
        <input type="text" value={props.alt} onChange={e => onUpdate({ alt: e.target.value })}
          className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1.5 text-xs text-[#CCC] focus:outline-none"
          placeholder="Description de l'image" />
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Ajustement</label>
        <div className="flex gap-1">
          {(['cover', 'contain', 'fill'] as const).map(f => (
            <button key={f} onClick={() => onUpdate({ objectFit: f })}
              className={`flex-1 py-1.5 rounded text-xs border transition-all ${props.objectFit === f ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Arrondi</label>
          <span className="text-[10px] text-[#666]">{props.borderRadius}px</span>
        </div>
        <input type="range" min={0} max={50}
          value={props.borderRadius}
          onChange={e => onUpdate({ borderRadius: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>
    </div>
  )
}

function ShapePanel({ props, onUpdate }: { props: ShapeProps; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Forme</p>
      <div className="flex gap-1.5">
        {(['rectangle', 'circle', 'triangle'] as const).map(s => (
          <button key={s} onClick={() => onUpdate({ shapeType: s })}
            className={`flex-1 py-1.5 rounded text-xs border transition-all ${props.shapeType === s ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}>
            {s === 'rectangle' ? '⬛' : s === 'circle' ? '⬤' : '▲'}
          </button>
        ))}
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Couleur de remplissage</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="color" value={props.fill} onChange={e => onUpdate({ fill: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-[#2E2E2E]" />
          {QUICK_COLORS.map(c => (
            <button key={c} onClick={() => onUpdate({ fill: c })}
              className="w-5 h-5 rounded-full border border-[#2E2E2E] hover:scale-110 transition-all hover:border-[#00D4FF]"
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-[#555] block mb-1">Bordure</label>
          <input type="color" value={props.stroke} onChange={e => onUpdate({ stroke: e.target.value })}
            className="w-full h-8 rounded cursor-pointer border border-[#2E2E2E]" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-[#555]">Épaisseur</label>
            <span className="text-[10px] text-[#666]">{props.strokeWidth}px</span>
          </div>
          <input type="range" min={0} max={12}
            value={props.strokeWidth}
            onChange={e => onUpdate({ strokeWidth: Number(e.target.value) })}
            className="w-full accent-[#00D4FF] mt-1" />
        </div>
      </div>
      {props.shapeType === 'rectangle' && (
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-[10px] text-[#555]">Arrondi</label>
            <span className="text-[10px] text-[#666]">{props.borderRadius}px</span>
          </div>
          <input type="range" min={0} max={100}
            value={props.borderRadius}
            onChange={e => onUpdate({ borderRadius: Number(e.target.value) })}
            className="w-full accent-[#00D4FF]" />
        </div>
      )}
    </div>
  )
}

function IconPanel({ props, onUpdate }: { props: IconProps; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Icône</p>
      <div>
        <label className="text-[10px] text-[#555] block mb-1">Icône Lucide</label>
        <select value={props.iconName} onChange={e => onUpdate({ iconName: e.target.value })}
          className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1.5 text-xs text-[#CCC]">
          {ICON_NAMES.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Couleur</label>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="color" value={props.color} onChange={e => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-[#2E2E2E]" />
          {QUICK_COLORS.map(c => (
            <button key={c} onClick={() => onUpdate({ color: c })}
              className="w-5 h-5 rounded-full border border-[#2E2E2E] hover:scale-110 transition-all"
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Taille</label>
          <span className="text-[10px] text-[#666]">{props.size}px</span>
        </div>
        <input type="range" min={16} max={256}
          value={props.size}
          onChange={e => onUpdate({ size: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>
    </div>
  )
}

function CodePanel({ props, onUpdate }: { props: CodeProps; onUpdate: (p: Record<string, unknown>) => void }) {
  const LANGS = ['javascript', 'typescript', 'python', 'java', 'css', 'html', 'bash', 'sql', 'json', 'go', 'rust']
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Code</p>
      <div>
        <label className="text-[10px] text-[#555] block mb-1">Langage</label>
        <select value={props.language} onChange={e => onUpdate({ language: e.target.value })}
          className="w-full bg-[#111] border border-[#2E2E2E] rounded px-2 py-1.5 text-xs text-[#CCC]">
          {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1">Code</label>
        <textarea value={props.code} onChange={e => onUpdate({ code: e.target.value })}
          rows={8}
          className="w-full bg-[#0D1117] border border-[#2E2E2E] rounded-lg px-2 py-2 text-xs text-[#C9D1D9] font-mono resize-none focus:outline-none focus:border-[#00D4FF]/40"
          spellCheck={false} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={props.showLineNumbers}
          onChange={e => onUpdate({ showLineNumbers: e.target.checked })}
          className="accent-[#00D4FF]" />
        <span className="text-xs text-[#888]">Numéros de ligne</span>
      </label>
    </div>
  )
}

function LinePanel({ props, onUpdate }: { props: LineProps; onUpdate: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] text-[#555] uppercase tracking-wider">Ligne</p>
      <div className="flex gap-1.5">
        {(['horizontal', 'vertical'] as const).map(o => (
          <button key={o} onClick={() => onUpdate({ orientation: o })}
            className={`flex-1 py-1.5 rounded text-xs border transition-all ${props.orientation === o ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}>
            {o === 'horizontal' ? '— Horizontal' : '| Vertical'}
          </button>
        ))}
      </div>
      <div>
        <label className="text-[10px] text-[#555] block mb-1.5">Couleur</label>
        <div className="flex items-center gap-2">
          <input type="color" value={props.color} onChange={e => onUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer border border-[#2E2E2E]" />
          {QUICK_COLORS.slice(0, 5).map(c => (
            <button key={c} onClick={() => onUpdate({ color: c })}
              className="w-5 h-5 rounded-full border border-[#2E2E2E] hover:scale-110 transition-all"
              style={{ background: c }} />
          ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-[10px] text-[#555]">Épaisseur</label>
          <span className="text-[10px] text-[#666]">{props.thickness}px</span>
        </div>
        <input type="range" min={1} max={20}
          value={props.thickness}
          onChange={e => onUpdate({ thickness: Number(e.target.value) })}
          className="w-full accent-[#00D4FF]" />
      </div>
      <div className="flex gap-1.5">
        {(['solid', 'dashed', 'dotted'] as const).map(s => (
          <button key={s} onClick={() => onUpdate({ style: s })}
            className={`flex-1 py-1.5 rounded text-xs border transition-all ${props.style === s ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-[#00D4FF]' : 'border-[#2E2E2E] text-[#666]'}`}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
