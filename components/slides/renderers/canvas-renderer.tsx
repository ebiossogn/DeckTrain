'use client'

import type { SlideElement } from '@/types/slides'
import { ElementRenderer } from '@/components/editor/element-renderer'

interface Props {
  content: {
    elements: SlideElement[]
    background: { type: string; value: string; gradientTo?: string }
  }
}

export function CanvasSlide({ content }: Props) {
  const { elements = [], background } = content

  const bgStyle =
    background?.type === 'gradient'
      ? `linear-gradient(135deg, ${background.value}, ${background.gradientTo ?? '#00D4FF'})`
      : background?.type === 'image'
      ? `url(${background.value}) center/cover no-repeat`
      : background?.value ?? '#111111'

  return (
    <div
      className="relative w-full h-full"
      style={{ background: bgStyle }}
    >
      {[...elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map(el => (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              transform: `rotate(${el.rotation}deg)`,
              opacity: el.opacity,
              zIndex: el.zIndex,
            }}
          >
            <ElementRenderer element={el} />
          </div>
        ))}
    </div>
  )
}
