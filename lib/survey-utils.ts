import type { QuestionType, QuestionResult, McqOptions, SliderOptions } from '@/types/surveys'

/** Génère un code unique de 6 caractères */
export function generateSurveyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Agrège les réponses brutes d'une question */
export function aggregateResponses(
  type: QuestionType,
  options: string | null,
  values: string[],
): QuestionResult {
  switch (type) {

    case 'mcq': {
      const parsed = options ? (JSON.parse(options) as McqOptions).choices : []
      const counts: Record<string, number> = {}
      for (const v of values) {
        try {
          const selected: string[] = JSON.parse(v)
          for (const s of selected) counts[s] = (counts[s] ?? 0) + 1
        } catch {
          counts[v] = (counts[v] ?? 0) + 1
        }
      }
      const total = values.length
      return {
        type: 'mcq',
        total,
        choices: parsed.map((label) => ({
          label,
          count: counts[label] ?? 0,
          pct: total > 0 ? Math.round(((counts[label] ?? 0) / total) * 100) : 0,
        })),
      }
    }

    case 'wordcloud': {
      const counts: Record<string, number> = {}
      for (const v of values) {
        const word = v.trim().toLowerCase()
        if (word) counts[word] = (counts[word] ?? 0) + 1
      }
      return {
        type: 'wordcloud',
        total: values.length,
        words: Object.entries(counts)
          .map(([word, count]) => ({ word, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 50),
      }
    }

    case 'rating': {
      const distribution = [1, 2, 3, 4, 5].map((star) => ({
        star,
        count: values.filter((v) => Number(v) === star).length,
      }))
      const total  = values.length
      const sum    = values.reduce((acc, v) => acc + (Number(v) || 0), 0)
      return { type: 'rating', total, distribution, average: total > 0 ? Math.round((sum / total) * 10) / 10 : 0 }
    }

    case 'qa':
      return { type: 'qa', total: values.length, responses: values.filter(Boolean) }

    case 'slider': {
      const nums   = values.map(Number).filter((n) => !isNaN(n))
      const total  = nums.length
      const avg    = total > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / total) : 0
      const opts   = options ? (JSON.parse(options) as SliderOptions) : { min: 0, max: 100, leftLabel: '', rightLabel: '' }
      const range  = (opts.max - opts.min) || 100
      const buckets = 10
      const histogram = Array.from({ length: buckets }, (_, i) => {
        const lo = opts.min + (range / buckets) * i
        const hi = opts.min + (range / buckets) * (i + 1)
        return {
          bucket: `${Math.round(lo)}-${Math.round(hi)}`,
          count: nums.filter((n) => n >= lo && (i === buckets - 1 ? n <= hi : n < hi)).length,
        }
      })
      return { type: 'slider', total, average: avg, histogram }
    }
  }
}

/** Exporte les résultats en CSV */
export function exportResultsCSV(surveyTitle: string, results: { title: string; type: QuestionType; result: QuestionResult }[]): string {
  const rows: string[] = [`"Sondage","${surveyTitle}"`, '']

  for (const q of results) {
    rows.push(`"Question","${q.title.replace(/"/g, '""')}"`)
    rows.push(`"Type","${q.type}"`)

    if (q.result.type === 'mcq') {
      rows.push('"Choix","Votes","Pourcentage"')
      for (const c of q.result.choices) rows.push(`"${c.label.replace(/"/g, '""')}","${c.count}","${c.pct}%"`)
    } else if (q.result.type === 'wordcloud') {
      rows.push('"Mot","Occurrences"')
      for (const w of q.result.words) rows.push(`"${w.word}","${w.count}"`)
    } else if (q.result.type === 'rating') {
      rows.push('"Étoiles","Votes"')
      for (const d of q.result.distribution) rows.push(`"${d.star} étoile(s)","${d.count}"`)
      rows.push(`"Moyenne","${q.result.average}"`)
    } else if (q.result.type === 'qa') {
      rows.push('"Réponse"')
      for (const r of q.result.responses) rows.push(`"${r.replace(/"/g, '""')}"`)
    } else if (q.result.type === 'slider') {
      rows.push('"Tranche","Votes"')
      for (const h of q.result.histogram) rows.push(`"${h.bucket}","${h.count}"`)
      rows.push(`"Moyenne","${q.result.average}"`)
    }
    rows.push(`"Réponses totales","${q.result.total}"`, '')
  }

  return rows.join('\n')
}
