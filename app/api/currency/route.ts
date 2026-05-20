import { NextResponse } from 'next/server'

export const revalidate = 3600

// Taux statiques base GNF (1 GNF → devise) — mai 2026
const FALLBACK_RATES: Record<string, number> = {
  GNF: 1,
  USD: 0.000116,
  EUR: 0.000107,
  XOF: 0.070,
  XAF: 0.070,
  MAD: 0.001165,
  CAD: 0.000158,
  GBP: 0.000091,
}

// Réponse fallback dans le format attendu par le pricing (base XOF)
// 1 XOF = 1/0.070 GNF ≈ 14.286
const FALLBACK_RESPONSE = {
  gnf: +(1 / FALLBACK_RATES.XOF).toFixed(4),        // ~14.2857
  eur: +(FALLBACK_RATES.EUR / FALLBACK_RATES.XOF).toFixed(6), // ~0.001529
  usd: +(FALLBACK_RATES.USD / FALLBACK_RATES.XOF).toFixed(6), // ~0.001657
  updatedAt: null as string | null,
  fallback: true,
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 3600 } })
    return res
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  // Tentative 1 — CDN jsdelivr (currency-api)
  try {
    const res = await fetchWithTimeout(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xof.json',
      3000,
    )
    if (!res.ok) throw new Error('upstream error')

    const data = await res.json() as { date: string; xof: Record<string, number> }

    return NextResponse.json({
      gnf: data.xof['gnf'] ?? FALLBACK_RESPONSE.gnf,
      eur: data.xof['eur'] ?? FALLBACK_RESPONSE.eur,
      usd: data.xof['usd'] ?? FALLBACK_RESPONSE.usd,
      updatedAt: data.date,
      fallback: false,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
        'X-Rates-Source': 'live',
      },
    })
  } catch { /* timeout ou erreur réseau → tentative 2 */ }

  // Tentative 2 — API miroir
  try {
    const res = await fetchWithTimeout(
      'https://latest.currency-api.pages.dev/v1/currencies/xof.json',
      3000,
    )
    if (!res.ok) throw new Error('upstream error')

    const data = await res.json() as { date: string; xof: Record<string, number> }

    return NextResponse.json({
      gnf: data.xof['gnf'] ?? FALLBACK_RESPONSE.gnf,
      eur: data.xof['eur'] ?? FALLBACK_RESPONSE.eur,
      usd: data.xof['usd'] ?? FALLBACK_RESPONSE.usd,
      updatedAt: data.date,
      fallback: false,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300',
        'X-Rates-Source': 'live-mirror',
      },
    })
  } catch { /* les deux APIs injoignables → fallback statique */ }

  // Fallback final — taux statiques, ne plante jamais
  return NextResponse.json(FALLBACK_RESPONSE, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=300',
      'X-Rates-Source': 'fallback',
    },
  })
}
