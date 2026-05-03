import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: { code: string } }) {
  const survey = await prisma.survey.findUnique({
    where: { code: params.code.toUpperCase() },
    select: { id: true, isActive: true, isLive: true },
  })
  if (!survey || !survey.isActive) {
    return NextResponse.json({ error: 'Sondage introuvable' }, { status: 404 })
  }

  const { responses, respondent } = await req.json()
  /* responses: [{ questionId: string, value: string }] */
  if (!Array.isArray(responses) || responses.length === 0) {
    return NextResponse.json({ error: 'Aucune réponse fournie' }, { status: 400 })
  }

  /* Évite les doublons par respondent + question */
  const created: string[] = []
  for (const r of responses) {
    if (!r.questionId || r.value === undefined || r.value === null) continue

    const existing = respondent
      ? await prisma.surveyResponse.findFirst({ where: { questionId: r.questionId, respondent } })
      : null

    if (existing) {
      await prisma.surveyResponse.update({ where: { id: existing.id }, data: { value: String(r.value) } })
    } else {
      const response = await prisma.surveyResponse.create({
        data: { questionId: r.questionId, value: String(r.value), respondent: respondent ?? null },
      })
      created.push(response.id)
    }
  }

  return NextResponse.json({ ok: true, count: created.length })
}
