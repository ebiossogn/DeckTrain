import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    include: { questions: { orderBy: { order: 'asc' }, select: { id: true, type: true, order: true, title: true, options: true, multiple: true } } },
  })

  if (!survey || !survey.isActive) {
    return NextResponse.json({ error: 'Sondage introuvable ou inactif' }, { status: 404 })
  }

  return NextResponse.json({
    id: survey.id,
    title: survey.title,
    description: survey.description,
    code: survey.code,
    isLive: survey.isLive,
    questions: survey.questions,
  })
}
