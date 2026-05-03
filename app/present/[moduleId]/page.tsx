import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { codeToHtml } from 'shiki'
import { SlideViewer } from '@/components/present/slide-viewer'
import type { SlideWithContent, TitleCodeContent } from '@/types/slides'

export default async function PresentModulePage({
  params,
}: {
  params: { moduleId: string }
}) {
  const module = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  if (!module) notFound()

  /* Pré-rendu Shiki des slides code (côté serveur) */
  const slides: SlideWithContent[] = await Promise.all(
    module.slides.map(async (s) => {
      const content = JSON.parse(s.content) as Record<string, unknown>

      if (s.type === 'title-code') {
        const { code, language } = content as unknown as TitleCodeContent
        try {
          content.highlightedHtml = await codeToHtml(code || '// vide', {
            lang: language || 'text',
            theme: 'github-dark',
          })
        } catch {
          /* langage inconnu → fallback sans coloration */
        }
      }

      return {
        id: s.id,
        moduleId: s.moduleId,
        type: s.type as SlideWithContent['type'],
        order: s.order,
        content: content as unknown as SlideWithContent['content'],
        speakerNotes: s.speakerNotes,
        timerMinutes: s.timerMinutes,
        transition: (s.transition ?? null) as SlideWithContent['transition'],
        createdAt: s.createdAt.toISOString(),
      }
    })
  )

  return (
    <SlideViewer
      moduleId={module.id}
      moduleTitle={module.title}
      slides={slides}
    />
  )
}
