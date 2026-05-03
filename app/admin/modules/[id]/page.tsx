import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { SlideManager } from '@/components/admin/slides/slide-manager'
import type { SlideWithContent } from '@/types/slides'

export default async function ModuleSlidesPage({ params }: { params: { id: string } }) {
  const module = await prisma.module.findUnique({
    where: { id: params.id },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  if (!module) notFound()

  const slides: SlideWithContent[] = module.slides.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    type: s.type as SlideWithContent['type'],
    order: s.order,
    content: JSON.parse(s.content),
    speakerNotes: s.speakerNotes,
    timerMinutes: s.timerMinutes,
    transition: (s.transition ?? null) as SlideWithContent['transition'],
    createdAt: s.createdAt.toISOString(),
  }))

  return (
    <SlideManager
      module={{ id: module.id, title: module.title, description: module.description }}
      initialSlides={slides}
    />
  )
}
