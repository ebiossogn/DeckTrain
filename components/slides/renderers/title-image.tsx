import Image from 'next/image'
import type { TitleImageContent } from '@/types/slides'
import { cn } from '@/lib/utils'

export function TitleImageSlide({ content }: { content: TitleImageContent }) {
  const { title, imageUrl, altText, position } = content
  const isCenter = position === 'center'

  if (isCenter) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-dark-bg px-12 py-10 gap-8">
        <h1 className="font-syne font-bold text-5xl xl:text-6xl text-dark-text text-center">
          {title}
        </h1>
        {imageUrl && (
          <div className="relative flex-1 w-full max-w-3xl min-h-0">
            <img src={imageUrl} alt={altText} className="w-full h-full object-contain rounded-2xl" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('w-full h-full flex bg-dark-bg', position === 'right' && 'flex-row-reverse')}>
      {/* Image panel */}
      <div className="w-[45%] relative overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={altText} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-dark-surface flex items-center justify-center text-dark-text/20 text-4xl">
            📷
          </div>
        )}
      </div>
      {/* Divider */}
      <div className="w-px bg-accent/20" />
      {/* Text panel */}
      <div className="flex-1 flex flex-col justify-center px-12 py-10">
        <h1 className="font-syne font-bold text-4xl xl:text-6xl text-dark-text leading-tight mb-4">
          {title}
        </h1>
        <div className="w-16 h-1 bg-accent rounded-full" />
        {altText && (
          <p className="font-inter text-base text-dark-text/45 mt-4 italic">{altText}</p>
        )}
      </div>
    </div>
  )
}
