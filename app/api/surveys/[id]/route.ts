import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

type P = { params: { id: string } }

export async function GET(_req: Request, { params }: P) {
  const err = await assertAuth()
  if (err) return err

  const survey = await prisma.survey.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })
  if (!survey) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  return NextResponse.json({
    ...survey,
    createdAt: survey.createdAt.toISOString(),
    questions: survey.questions.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
  })
}

export async function PATCH(req: Request, { params }: P) {
  const err = await assertAuth()
  if (err) return err

  const { title, description, isActive, questions } = await req.json()

  await prisma.survey.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    },
  })

  /* Replace questions if provided */
  if (questions !== undefined) {
    await prisma.surveyQuestion.deleteMany({ where: { surveyId: params.id } })
    if (questions.length > 0) {
      await prisma.surveyQuestion.createMany({
        data: questions.map((q: { type: string; title: string; options?: string; multiple?: boolean }, i: number) => ({
          surveyId: params.id,
          type: q.type,
          order: i,
          title: q.title,
          options: q.options ?? null,
          multiple: q.multiple ?? false,
        })),
      })
    }
  }

  const updated = await prisma.survey.findUnique({
    where: { id: params.id },
    include: { questions: { orderBy: { order: 'asc' } } },
  })

  return NextResponse.json({
    ...updated,
    createdAt: updated!.createdAt.toISOString(),
    questions: updated!.questions.map((q) => ({ ...q, createdAt: q.createdAt.toISOString() })),
  })
}

export async function DELETE(_req: Request, { params }: P) {
  const err = await assertAuth()
  if (err) return err
  await prisma.survey.update({
    where: { id: params.id },
    data: { isDeleted: true, deletedAt: new Date() },
  })
  return NextResponse.json({ ok: true })
}
