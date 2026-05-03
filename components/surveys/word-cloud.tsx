'use client'

import { useMemo } from 'react'

interface WordCloudProps {
  words: { word: string; count: number }[]
  maxWords?: number
}

const COLORS = ['#00D4FF', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#f97316', '#84cc16']

export function WordCloud({ words, maxWords = 40 }: WordCloudProps) {
  const data = useMemo(() => {
    const top = words.slice(0, maxWords)
    const max = top[0]?.count ?? 1
    const min = top[top.length - 1]?.count ?? 1
    const range = max - min || 1

    return top.map((w, i) => {
      const norm = (w.count - min) / range
      const size = Math.round(12 + norm * 32)  // 12px → 44px
      return {
        ...w,
        size,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() > 0.75 ? -15 + Math.random() * 30 : 0,
      }
    })
  }, [words, maxWords])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-dark-text/30 text-sm">
        En attente de réponses…
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center p-4 min-h-32">
      {data.map((w) => (
        <span
          key={w.word}
          className="font-syne font-bold transition-all duration-500 cursor-default select-none"
          style={{
            fontSize: w.size,
            color: w.color,
            transform: `rotate(${w.rotate}deg)`,
            opacity: 0.7 + (w.count / (data[0]?.count ?? 1)) * 0.3,
          }}
          title={`${w.word}: ${w.count}`}
        >
          {w.word}
        </span>
      ))}
    </div>
  )
}
