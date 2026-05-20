'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { TitleBulletsContent } from '@/types/slides'

type WithTheme = TitleBulletsContent & {
  _theme?: { background?: string; accent?: string; textColor?: string }
  emoji?: string
}

export function TitleBulletsSlide({ content }: { content: TitleBulletsContent }) {
  const c      = content as WithTheme
  const bg     = c._theme?.background
  const accent = c._theme?.accent ?? '#00D4FF'
  const color  = c._theme?.textColor

  return (
    <div
      className="w-full h-full flex flex-col justify-center px-16 py-12"
      style={{ background: bg ?? undefined }}
    >
      {!bg && <div className="absolute inset-0 bg-dark-bg -z-10" />}
      <div className="w-full max-w-4xl relative">
        {c.emoji && <div className="text-5xl mb-4 select-none">{c.emoji}</div>}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-syne font-bold text-5xl xl:text-7xl mb-3"
          style={{ color: color ?? undefined }}
        >
          <span className={color ? '' : 'text-dark-text'}>{content.title}</span>
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-20 h-1 rounded-full mb-10 origin-left"
          style={{ background: accent }}
        />
        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
          className="space-y-5"
        >
          {content.bullets.map((bullet) => (
            <motion.li
              key={bullet.id}
              variants={{
                hidden: { opacity: 0, x: -30 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
              }}
              className="flex items-start gap-4"
            >
              <ChevronRight
                size={22}
                className="flex-shrink-0 mt-1"
                style={{ color: accent }}
                strokeWidth={2.5}
              />
              <span className="font-inter text-xl xl:text-2xl text-dark-text/90 leading-snug">
                {bullet.text}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </div>
  )
}
