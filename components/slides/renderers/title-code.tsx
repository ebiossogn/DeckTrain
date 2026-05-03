'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { TitleCodeContent } from '@/types/slides'

export function TitleCodeSlide({ content }: { content: TitleCodeContent }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full h-full flex flex-col bg-dark-bg px-12 py-10">
      <h1 className="font-syne font-bold text-4xl xl:text-5xl text-dark-text mb-6 flex-shrink-0">
        {content.title}
      </h1>

      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden border border-dark-text/10 bg-[#0d1117]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#161b22] border-b border-dark-text/10 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-amber-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="font-mono text-xs text-dark-text/40">{content.language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto p-6 min-h-0">
          {content.highlightedHtml ? (
            <div
              className="shiki-output text-sm leading-relaxed font-mono [&_pre]:!bg-transparent [&_pre]:!p-0 [&_code]:!bg-transparent"
              dangerouslySetInnerHTML={{ __html: content.highlightedHtml }}
            />
          ) : (
            <pre className="text-sm leading-relaxed font-mono text-dark-text/80 whitespace-pre-wrap">
              <code>{content.code}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
