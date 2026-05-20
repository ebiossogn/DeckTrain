import type { ComparisonContent } from '@/types/slides'
import { sanitizeHtml } from '@/lib/sanitize'

export function ComparisonSlide({ content }: { content: ComparisonContent }) {
  return (
    <div className="w-full h-full flex bg-dark-bg">
      {/* Colonne gauche */}
      <div className="flex-1 flex flex-col justify-center px-12 py-10">
        <h2 className="font-syne font-bold text-3xl xl:text-4xl text-dark-text mb-4">
          {content.leftTitle}
        </h2>
        <div className="w-12 h-1 bg-accent/40 rounded-full mb-6" />
        <div
          className="font-inter text-lg xl:text-xl text-dark-text/75 leading-relaxed prose-presentation"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.leftContent) }}
        />
      </div>

      {/* Séparateur central */}
      <div className="flex flex-col items-center justify-center flex-shrink-0 px-0">
        <div className="w-px flex-1 bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
        <div className="py-4 px-0">
          <span className="writing-mode-vertical font-syne font-bold text-sm text-accent tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
            {content.dividerLabel || 'VS'}
          </span>
        </div>
        <div className="w-px flex-1 bg-gradient-to-b from-accent/40 via-accent/40 to-transparent" />
      </div>

      {/* Colonne droite */}
      <div className="flex-1 flex flex-col justify-center px-12 py-10">
        <h2 className="font-syne font-bold text-3xl xl:text-4xl text-dark-text mb-4">
          {content.rightTitle}
        </h2>
        <div className="w-12 h-1 bg-accent rounded-full mb-6" />
        <div
          className="font-inter text-lg xl:text-xl text-dark-text/75 leading-relaxed prose-presentation"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.rightContent) }}
        />
      </div>
    </div>
  )
}
