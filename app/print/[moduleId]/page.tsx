import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { SlideWithContent, SlideType } from '@/types/slides'

const PrintClient = dynamic(() => import('./print-client'), { ssr: false })

interface Props { params: { moduleId: string } }

export default async function PrintPage({ params }: Props) {
  const module = await prisma.module.findUnique({
    where: { id: params.moduleId },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  if (!module) notFound()

  const slides: SlideWithContent[] = module.slides.map((s) => ({
    id: s.id,
    moduleId: s.moduleId,
    type: s.type as SlideType,
    order: s.order,
    content: JSON.parse(s.content),
    speakerNotes: s.speakerNotes,
    timerMinutes: s.timerMinutes,
    transition: s.transition as SlideWithContent['transition'],
    createdAt: s.createdAt.toISOString(),
  }))

  return <PrintClient moduleTitle={module.title} slides={slides} />
}
