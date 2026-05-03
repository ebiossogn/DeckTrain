import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertAuth } from '@/lib/api-auth'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; exerciseId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  const { title, type, content, difficulty, solution } = await req.json()
  const exercise = await prisma.exercise.update({
    where: { id: params.exerciseId },
    data: {
      title: title?.trim(),
      type,
      content: JSON.stringify(content || {}),
      difficulty,
      solution: solution?.trim() || null,
    },
  })
  return NextResponse.json({
    ...exercise,
    content: JSON.parse(exercise.content),
    createdAt: exercise.createdAt.toISOString(),
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; exerciseId: string } }
) {
  const err = await assertAuth()
  if (err) return err
  await prisma.exercise.delete({ where: { id: params.exerciseId } })
  return NextResponse.json({ ok: true })
}
