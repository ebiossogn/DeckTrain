import type { TitleTextContent } from '@/types/slides'

export function TitleTextSlide({ content }: { content: TitleTextContent }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg px-16 py-12">
      <div className="w-full max-w-4xl">
        <h1 className="font-syne font-bold text-5xl xl:text-7xl text-dark-text leading-tight mb-6">
          {content.title}
        </h1>
        <div className="w-20 h-1 bg-accent rounded-full mb-8" />
        <div
          className="font-inter text-xl xl:text-2xl text-dark-text/80 leading-relaxed prose-presentation"
          dangerouslySetInnerHTML={{ __html: content.body }}
        />
      </div>
    </div>
  )
}
