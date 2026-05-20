import type { FreeLayoutContent } from '@/types/slides'
import { sanitizeHtml } from '@/lib/sanitize'

export function FreeLayoutSlide({ content }: { content: FreeLayoutContent }) {
  return (
    <div className="w-full h-full flex flex-col bg-dark-bg px-16 py-12 overflow-auto">
      <h1 className="font-syne font-bold text-4xl xl:text-6xl text-dark-text mb-3 flex-shrink-0">
        {content.title}
      </h1>
      <div className="w-20 h-1 bg-accent rounded-full mb-8 flex-shrink-0" />
      <div
        className="font-inter text-lg xl:text-xl text-dark-text/80 leading-relaxed prose-presentation"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
      />
    </div>
  )
}
