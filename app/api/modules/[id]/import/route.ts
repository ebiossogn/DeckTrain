import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import path from 'path'
import fs from 'fs/promises'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const MAX_SLIDES    = 100

// ── Parsers ───────────────────────────────────────────────────────────────────

async function importFromPptx(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const JSZip   = require('jszip')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const xml2js  = require('xml2js')

  const zip = await JSZip.loadAsync(buffer)

  const slideFiles = Object.keys(zip.files)
    .filter((name: string) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a: string, b: string) => {
      const na = parseInt(a.match(/slide(\d+)/)?.[1] ?? '0')
      const nb = parseInt(b.match(/slide(\d+)/)?.[1] ?? '0')
      return na - nb
    })

  const slides = []

  for (const slideFile of slideFiles.slice(0, MAX_SLIDES)) {
    const xml     = await zip.files[slideFile].async('string')
    const parsed  = await xml2js.parseStringPromise(xml)
    slides.push(extractPptxSlide(parsed))
  }

  return slides
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPptxSlide(parsed: any) {
  try {
    const spTree = parsed?.['p:sld']?.['p:cSld']?.[0]?.['p:spTree']?.[0]
    const shapes = spTree?.['p:sp'] ?? []

    let title = ''
    const bodyTexts: string[] = []

    for (const shape of shapes) {
      const txBody = shape?.['p:txBody']?.[0]
      if (!txBody) continue

      const paragraphs = txBody?.['a:p'] ?? []
      const text = paragraphs
        .map((p: any) => (p?.['a:r'] ?? []).map((r: any) => r?.['a:t']?.[0] ?? '').join(''))
        .filter(Boolean)
        .join('\n')

      const phType = shape?.['p:nvSpPr']?.[0]?.['p:nvPr']?.[0]?.['p:ph']?.[0]?.['$']?.type
      if (phType === 'title' || phType === 'ctrTitle') {
        title = text
      } else if (text) {
        bodyTexts.push(text)
      }
    }

    const isBullets = bodyTexts.length >= 2 && bodyTexts.every((t) => t.length < 250)

    if (isBullets) {
      return {
        type: 'title-bullets' as const,
        content: JSON.stringify({ title: title || 'Slide', bullets: bodyTexts.map((t) => ({ text: t })) }),
        notes: null,
      }
    }

    return {
      type: 'title-text' as const,
      content: JSON.stringify({ title: title || 'Slide', body: bodyTexts.join('\n\n') }),
      notes: null,
    }
  } catch {
    return {
      type: 'title-text' as const,
      content: JSON.stringify({ title: 'Slide importée', body: 'Contenu non lisible.' }),
      notes: null,
    }
  }
}

async function importFromPdf(buffer: Buffer) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  let pdfData: { text: string; numpages: number }

  try {
    pdfData = await pdfParse(buffer)
  } catch {
    return [{
      type: 'title-text' as const,
      content: JSON.stringify({ title: 'Document PDF importé', body: 'Impossible de lire ce PDF (PDF scanné ou protégé).' }),
      notes: null,
    }]
  }

  const pages = pdfData.text.split('\f').filter((p: string) => p.trim())

  if (pages.length === 0) {
    return [{
      type: 'title-text' as const,
      content: JSON.stringify({ title: 'Document PDF importé', body: 'PDF sans texte extractible (document scanné).' }),
      notes: null,
    }]
  }

  return pages.slice(0, MAX_SLIDES).map((pageText: string, i: number) => {
    const lines = pageText.split('\n').map((l: string) => l.trim()).filter(Boolean)
    const title = lines[0] ?? `Page ${i + 1}`
    const rest  = lines.slice(1)
    const isList = rest.length >= 2 && rest.every((l: string) => l.length < 180)

    if (isList) {
      return {
        type: 'title-bullets' as const,
        content: JSON.stringify({
          title,
          bullets: rest.map((t) => ({ text: t.replace(/^[-•*]\s*/, '') })),
        }),
        notes: `Page ${i + 1} du PDF original`,
      }
    }

    return {
      type: 'title-text' as const,
      content: JSON.stringify({ title, body: rest.join('\n') }),
      notes: `Page ${i + 1} du PDF original`,
    }
  })
}

async function importFromImage(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const buffer      = Buffer.from(arrayBuffer)
  const ext         = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const fileName    = `imported_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const uploadDir   = path.join(process.cwd(), 'public', 'uploads')

  await fs.mkdir(uploadDir, { recursive: true })
  await fs.writeFile(path.join(uploadDir, fileName), buffer)

  const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')

  return [{
    type: 'title-image' as const,
    content: JSON.stringify({
      title: nameWithoutExt,
      imageUrl: `/uploads/${fileName}`,
      altText: nameWithoutExt,
      imagePosition: 'center',
    }),
    notes: 'Slide importée depuis image',
  }]
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.userType !== 'admin' && session.user.userType !== 'formateur')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const mode = (formData.get('mode') as string) || 'append'

  if (!file || !file.name) {
    return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Fichier trop volumineux (max 50 Mo)' }, { status: 400 })
  }

  const name = file.name.toLowerCase()
  let rawSlides: { type: string; content: string; notes: string | null }[]

  try {
    if (name.endsWith('.pptx')) {
      const buf = Buffer.from(await file.arrayBuffer())
      rawSlides = await importFromPptx(buf)
    } else if (name.endsWith('.pdf')) {
      const buf = Buffer.from(await file.arrayBuffer())
      rawSlides = await importFromPdf(buf)
    } else if (/\.(jpe?g|png|webp|gif)$/.test(name)) {
      rawSlides = await importFromImage(file)
    } else {
      return NextResponse.json(
        { error: 'Format non supporté. Utilisez .pptx, .pdf ou une image.' },
        { status: 400 }
      )
    }
  } catch (err) {
    console.error('[import] parse error:', err)
    return NextResponse.json({ error: 'Erreur lors de la lecture du fichier.' }, { status: 500 })
  }

  // Mode "replace" : on supprime d'abord les slides existantes
  if (mode === 'replace') {
    await prisma.slide.deleteMany({ where: { moduleId: params.id } })
  }

  // Calcul de l'offset d'ordre
  const last = await prisma.slide.findFirst({
    where: { moduleId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  const startOrder = (last?.order ?? -1) + 1

  // Insertion en batch
  const created = await prisma.$transaction(
    rawSlides.slice(0, MAX_SLIDES).map((s, idx) =>
      prisma.slide.create({
        data: {
          moduleId:    params.id,
          type:        s.type,
          content:     s.content,
          order:       startOrder + idx,
          speakerNotes: s.notes,
          timerMinutes: null,
          transition:  null,
        },
      })
    )
  )

  return NextResponse.json({
    success: true,
    imported: created.length,
    slides: created.map((s) => ({
      id:           s.id,
      moduleId:     s.moduleId,
      type:         s.type,
      order:        s.order,
      content:      JSON.parse(s.content),
      speakerNotes: s.speakerNotes,
      timerMinutes: s.timerMinutes,
      transition:   s.transition,
      createdAt:    s.createdAt.toISOString(),
    })),
  })
}
