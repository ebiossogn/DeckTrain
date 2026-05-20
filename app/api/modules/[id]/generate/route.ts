import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const MAX_SLIDES = 20

// ── Types internes ─────────────────────────────────────────────────────────────

interface AISlideTheme { background: string; accent: string; textColor: string }

interface AISlide {
  order: number
  type: string
  theme?: AISlideTheme
  content: Record<string, unknown>
  speakerNotes?: string
}

interface AIPresentation {
  title: string
  subtitle?: string
  slides: AISlide[]
}

// ── Convertit les slides IA en contenu compatible DB ──────────────────────────

function toDbContent(slide: AISlide): string {
  const { theme, content } = slide
  const base = { ...content, ...(theme ? { _theme: theme } : {}) }

  if (slide.type === 'title-bullets') {
    // Normalise les bullets : ajoute un id si absent
    const rawBullets = (content.bullets as Array<{ text: string; emoji?: string; id?: string }>) ?? []
    const bullets = rawBullets.map((b, i) => ({
      id: b.id ?? `ai-${Date.now()}-${i}`,
      text: b.emoji ? `${b.emoji} ${b.text}` : b.text,
    }))
    return JSON.stringify({ ...base, bullets })
  }

  if (slide.type === 'quote') {
    // background doit être 'cyan' | 'purple' | 'dark' | 'amber'
    const bg = content.background as string | undefined
    const allowed = ['cyan', 'purple', 'dark', 'amber']
    return JSON.stringify({
      ...base,
      background: allowed.includes(bg ?? '') ? bg : 'dark',
    })
  }

  if (slide.type === 'title-image') {
    return JSON.stringify({
      title:    content.title ?? '',
      imageUrl: content.imageUrl ?? '',
      altText:  content.altText ?? content.description ?? '',
      position: content.position ?? 'center',
      ...(theme ? { _theme: theme } : {}),
    })
  }

  if (slide.type === 'title-code') {
    return JSON.stringify({
      title:    content.title ?? '',
      code:     content.code ?? '',
      language: content.language ?? 'text',
      ...(theme ? { _theme: theme } : {}),
    })
  }

  return JSON.stringify(base)
}

// ── Prompt de génération ──────────────────────────────────────────────────────

function buildPrompt(
  topic: string,
  slideCount: number,
  tone: string,
  audience: string,
  language: string,
): string {
  return `Tu es un expert en création de présentations de formation percutantes, comme Gamma.app.

Génère une présentation complète sur : "${topic}"

Paramètres :
- Nombre de slides : ${slideCount}
- Ton : ${tone}
- Public cible : ${audience}
- Langue : ${language}

TYPES DISPONIBLES (utilise-les tous en variant) :
- title-text   : titre + paragraphe court
- title-bullets: titre + liste de 3-5 points
- title-image  : titre + imageUrl + altText + position (center|left|right)
- quote        : quote + author + background (cyan|purple|dark|amber)
- comparison   : leftTitle + leftContent + rightTitle + rightContent + dividerLabel
- title-code   : titre + code + language (si sujet technique)
- free-layout  : titre + body (layout créatif)

STRUCTURE :
- Slide 1 : accroche principale (title-text)
- Slide 2 : agenda (title-bullets)
- Slides intermédiaires : contenu varié avec beaucoup de title-bullets, comparisons, quotes
- Avant-dernière : récap (title-bullets)
- Dernière : conclusion ou citation (quote ou title-text)

RÈGLES :
1. Chaque slide doit avoir un thème visuel distinct (couleurs harmonieuses)
2. Max 60 mots par slide (hors bullets)
3. Les titres : 5 mots max, percutants
4. Ajoute un emoji dans chaque titre (champ "emoji" dans content)
5. Pour title-image : utilise des URLs Unsplash valides ou laisse imageUrl vide
6. Varie les couleurs de thème (accents : #00D4FF, #C8B89A, #10b981, #f59e0b, #8b5cf6)
7. Les notes présentateur doivent être utiles et détaillées

Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après :

{
  "presentation": {
    "title": "Titre court et accrocheur",
    "subtitle": "Sous-titre",
    "slides": [
      {
        "order": 1,
        "type": "title-text",
        "theme": { "background": "#0C0C14", "accent": "#00D4FF", "textColor": "#E8F4FF" },
        "content": { "title": "Titre", "body": "Corps court", "emoji": "🚀" },
        "speakerNotes": "Notes détaillées"
      }
    ]
  }
}`
}

// ── Route POST ────────────────────────────────────────────────────────────────

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.userType !== 'admin' && session.user.userType !== 'formateur')) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Clé API Anthropic manquante. Ajoutez ANTHROPIC_API_KEY dans .env.local.' },
      { status: 503 }
    )
  }

  const body = await request.json()
  const {
    topic      = '',
    slideCount = 10,
    tone       = 'professionnel',
    audience   = 'équipe interne',
    language   = 'français',
    mode       = 'preview',
    slides: providedSlides,
  } = body

  if (!topic.trim()) {
    return NextResponse.json({ error: 'Le sujet est obligatoire.' }, { status: 400 })
  }

  // ── Mode create avec slides déjà générées ─────────────────────────────────
  if (mode === 'create' && providedSlides) {
    return saveSlides(params.id, providedSlides, body.moduleTitle)
  }

  // ── Mode generate (preview ou create avec régénération) ───────────────────
  const client = new Anthropic({ apiKey })

  let generated: AIPresentation
  try {
    const message = await client.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 8000,
      messages:   [{ role: 'user', content: buildPrompt(topic, Math.min(slideCount, MAX_SLIDES), tone, audience, language) }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Réponse IA invalide (pas de JSON)')

    const parsed = JSON.parse(match[0])
    generated = parsed.presentation as AIPresentation
    if (!generated?.slides?.length) throw new Error('Aucune slide générée')
  } catch (err) {
    console.error('[generate] Claude error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Génération échouée' },
      { status: 500 }
    )
  }

  if (mode === 'preview') {
    return NextResponse.json({ success: true, preview: { presentation: generated } })
  }

  // mode === 'create' sans slides pré-générées → sauvegarder maintenant
  return saveSlides(params.id, generated.slides, generated.title)
}

// ── Sauvegarde en DB ──────────────────────────────────────────────────────────

async function saveSlides(moduleId: string, slides: AISlide[], moduleTitle?: string) {
  try {
    const last = await prisma.slide.findFirst({
      where: { moduleId },
      orderBy: { order: 'desc' },
      select: { order: true },
    })
    const startOrder = (last?.order ?? -1) + 1

    const created = await prisma.$transaction(
      slides.slice(0, MAX_SLIDES).map((slide, idx) =>
        prisma.slide.create({
          data: {
            moduleId,
            type:        slide.type,
            content:     toDbContent(slide),
            order:       startOrder + idx,
            speakerNotes: slide.speakerNotes ?? null,
            timerMinutes: null,
            transition:  null,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      created: created.length,
      moduleTitle,
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
  } catch (err) {
    console.error('[generate] DB save error:', err)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }
}
