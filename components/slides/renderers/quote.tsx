import type { QuoteContent } from '@/types/slides'
import { cn } from '@/lib/utils'

const BG: Record<QuoteContent['background'], string> = {
  cyan:   'bg-gradient-to-br from-cyan-900 via-[#0A0A0F] to-[#0A0A0F]',
  purple: 'bg-gradient-to-br from-violet-900 via-[#0A0A0F] to-[#0A0A0F]',
  amber:  'bg-gradient-to-br from-amber-900 via-[#0A0A0F] to-[#0A0A0F]',
  dark:   'bg-dark-bg',
}

export function QuoteSlide({ content }: { content: QuoteContent }) {
  return (
    <div className={cn('w-full h-full flex flex-col items-center justify-center px-16 py-12', BG[content.background])}>
      <div className="max-w-3xl text-center">
        {/* Guillemet décoratif */}
        <div className="font-syne text-8xl text-accent/25 leading-none mb-2 select-none">"</div>
        <blockquote className="font-syne text-3xl xl:text-4xl font-semibold text-dark-text italic leading-relaxed mb-8">
          {content.quote}
        </blockquote>
        <div className="w-12 h-px bg-accent/40 mx-auto mb-6" />
        <p className="font-inter text-lg text-dark-text/55 tracking-wide">
          — {content.author}
        </p>
      </div>
    </div>
  )
}
