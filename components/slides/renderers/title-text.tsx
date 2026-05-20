import type { TitleTextContent } from '@/types/slides'
import { sanitizeHtml } from '@/lib/sanitize'

type WithTheme = TitleTextContent & {
  _theme?: { background?: string; accent?: string; textColor?: string }
  emoji?: string
}

export function TitleTextSlide({ content }: { content: TitleTextContent }) {
  const c      = content as WithTheme
  const bg     = c._theme?.background
  const accent = c._theme?.accent ?? '#00D4FF'
  const color  = c._theme?.textColor

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center px-16 py-12"
      style={{ background: bg ?? undefined }}
    >
      {!bg && <div className="absolute inset-0 bg-dark-bg -z-10" />}
      <div className="w-full max-w-4xl relative">
        {c.emoji && <div className="text-6xl mb-6 select-none">{c.emoji}</div>}
        <h1
          className="font-syne font-bold text-5xl xl:text-7xl leading-tight mb-6"
          style={{ color: color ?? undefined }}
        >
          <span className={color ? '' : 'text-dark-text'}>{content.title}</span>
        </h1>
        <div className="w-20 h-1 rounded-full mb-8" style={{ background: accent }} />
        <div
          className="font-inter text-xl xl:text-2xl text-dark-text/80 leading-relaxed prose-presentation"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
        />
      </div>
    </div>
  )
}
