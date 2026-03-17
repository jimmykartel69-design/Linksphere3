/**
 * LinkSphere - i18n Configuration
 * Internationalization settings and utilities
 */

import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/constants'

export type Locale = typeof SUPPORTED_LOCALES[number]

export interface I18nConfig {
  defaultLocale: Locale
  locales: readonly Locale[]
  localeNames: Record<Locale, string>
}

export const i18nConfig: I18nConfig = {
  defaultLocale: DEFAULT_LOCALE as Locale,
  locales: SUPPORTED_LOCALES,
  localeNames: {
    en: 'English',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
  },
}

/**
 * Check if a locale is supported
 */
export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

/**
 * Get locale or fallback to default
 */
export function getValidLocale(locale: string | undefined): Locale {
  if (locale && isValidLocale(locale)) {
    return locale
  }
  return DEFAULT_LOCALE as Locale
}

/**
 * Get locale from Accept-Language header
 */
export function getLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE as Locale

  // Parse Accept-Language header
  const languages = acceptLanguage.split(',').map(lang => {
    const [code, q = '1'] = lang.trim().split(';q=')
    return { code: code.split('-')[0].toLowerCase(), q: parseFloat(q) }
  })

  // Sort by quality
  languages.sort((a, b) => b.q - a.q)

  // Find first supported locale
  for (const lang of languages) {
    if (isValidLocale(lang.code)) {
      return lang.code
    }
  }

  return DEFAULT_LOCALE as Locale
}
