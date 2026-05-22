'use client'

import type { SlideBackground } from '@/types/slides'

const PRESET_BACKGROUNDS = [
  { label: 'Sombre', value: '#111111' },
  { label: 'Anthracite', value: '#1C1C1C' },
  { label: 'Nuit', value: '#0A1A25' },
  { label: 'Marine', value: '#0A1628' },
  { label: 'Ivoire', value: '#F5F0E8' },
  { label: 'Blanc', value: '#FFFFFF' },
  { label: 'Cyan vif', value: '#001A20' },
  { label: 'Violet', value: '#0F0A1E' },
]

interface Props {
  background: SlideBackground
  onBackgroundChange: (bg: SlideBackground) => void
}

export function SlideProperties({ background, onBackgroundChange }: Props) {
  return (
    <div className="p-4 space-y-5">
      <h3 className="text-xs font-semibold text-[#888] uppercase tracking-wider">Fond de slide</h3>

      {/* Type selector */}
      <div className="flex gap-1.5">
        {(['color', 'gradient', 'image'] as const).map(t => (
          <button
            key={t}
            onClick={() => onBackgroundChange({ ...background, type: t })}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              background.type === t
                ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 text-[#00D4FF]'
                : 'border-[#2E2E2E] text-[#666] hover:border-[#444] hover:text-[#999]'
            }`}
          >
            {t === 'color' ? 'Couleur' : t === 'gradient' ? 'Dégradé' : 'Image'}
          </button>
        ))}
      </div>

      {background.type === 'color' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.value}
              onChange={e => onBackgroundChange({ ...background, value: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer border border-[#2E2E2E] bg-transparent"
            />
            <input
              type="text"
              value={background.value}
              onChange={e => onBackgroundChange({ ...background, value: e.target.value })}
              className="flex-1 bg-[#111] border border-[#2E2E2E] rounded-lg px-2 py-1.5 text-xs text-[#CCC] font-mono"
              placeholder="#111111"
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {PRESET_BACKGROUNDS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => onBackgroundChange({ ...background, value })}
                title={label}
                className={`h-8 rounded-lg border transition-all ${
                  background.value === value ? 'border-[#00D4FF]' : 'border-[#2E2E2E] hover:border-[#555]'
                }`}
                style={{ background: value }}
              />
            ))}
          </div>
        </div>
      )}

      {background.type === 'gradient' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[10px] text-[#666] mb-1">Depuis</p>
              <input
                type="color"
                value={background.value}
                onChange={e => onBackgroundChange({ ...background, value: e.target.value })}
                className="w-full h-8 rounded cursor-pointer border border-[#2E2E2E]"
              />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-[#666] mb-1">Vers</p>
              <input
                type="color"
                value={background.gradientTo ?? '#00D4FF'}
                onChange={e => onBackgroundChange({ ...background, gradientTo: e.target.value })}
                className="w-full h-8 rounded cursor-pointer border border-[#2E2E2E]"
              />
            </div>
          </div>
          <div
            className="h-12 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${background.value}, ${background.gradientTo ?? '#00D4FF'})`,
            }}
          />
        </div>
      )}

      {background.type === 'image' && (
        <div className="space-y-2">
          <p className="text-[10px] text-[#666]">URL de l'image</p>
          <input
            type="url"
            value={background.value}
            onChange={e => onBackgroundChange({ ...background, value: e.target.value })}
            className="w-full bg-[#111] border border-[#2E2E2E] rounded-lg px-2 py-1.5 text-xs text-[#CCC]"
            placeholder="https://..."
          />
        </div>
      )}

      <p className="text-[10px] text-[#444] text-center pt-2">© CHRIST J.</p>
    </div>
  )
}
