import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const SUPPORTED = ['fr', 'en'] as const
type Locale = (typeof SUPPORTED)[number]

function resolveLocale(raw: string | undefined): Locale {
  if (raw && SUPPORTED.includes(raw as Locale)) return raw as Locale
  return 'fr'
}

export default getRequestConfig(async () => {
  const locale = resolveLocale(cookies().get('locale')?.value)
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
