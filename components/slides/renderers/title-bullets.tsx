'use client'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { TitleBulletsContent } from '@/types/slides'

export function TitleBulletsSlide({ content }: { content: TitleBulletsContent }) {
  return (
    <div className="w-full h-full flex flex-col justify-center bg-dark-bg px-16 py-12">
      <div className="w-full max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-syne font-bold text-5xl xl:text-7xl text-dark-text mb-3"
        >
          {content.title}
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-20 h-1 bg-accent rounded-full mb-10 origin-left"
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
                className="text-accent flex-shrink-0 mt-1"
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
