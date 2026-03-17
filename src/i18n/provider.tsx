/**
 * LinkSphere - Translation Provider
 * React context for translations
 */

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES } from '@/lib/constants'
import type enTranslations from './locales/en.json'

type Locale = typeof SUPPORTED_LOCALES[number]
type TranslationKey = keyof typeof enTranslations
type Translations = typeof enTranslations

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
  localeName: string
}

const TranslationContext = createContext<TranslationContextType | null>(null)

// Cache for loaded translations
const translationCache: Record<Locale, Translations | null> = {
  en: null,
  fr: null,
  es: null,
  de: null,
}

// Pre-load English translations (default)
import translations_en from './locales/en.json'
translationCache.en = translations_en as Translations

async function loadTranslations(locale: Locale): Promise<Translations> {
  if (translationCache[locale]) {
    return translationCache[locale]!
  }

  try {
    const translations = await import(`./locales/${locale}.json`)
    translationCache[locale] = translations.default || translations
    return translationCache[locale]!
  } catch {
    console.warn(`Failed to load translations for ${locale}, falling back to English`)
    return translationCache.en!
  }
}

interface TranslationProviderProps {
  children: ReactNode
  initialLocale?: Locale
  initialTranslations?: Translations
}

export function TranslationProvider({
  children,
  initialLocale,
  initialTranslations,
}: TranslationProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale || DEFAULT_LOCALE as Locale)
  const [translations, setTranslations] = useState<Translations>(
    initialTranslations || translationCache.en || (translations_en as Translations)
  )

  // Load translations when locale changes
  useEffect(() => {
    if (initialLocale && initialTranslations) {
      translationCache[initialLocale] = initialTranslations
    }

    loadTranslations(locale).then(setTranslations)
  }, [locale, initialLocale, initialTranslations])

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale)
    
    // Store preference
    if (typeof window !== 'undefined') {
      localStorage.setItem('linksphere_locale', newLocale)
      document.documentElement.lang = newLocale
    }
  }, [])

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = (translations as Record<string, string>)[key] || key

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value))
      })
    }

    return text
  }, [translations])

  return (
    <TranslationContext.Provider
      value={{
        locale,
        setLocale,
        t,
        localeName: LOCALE_NAMES[locale] || locale,
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Server-side helper
export function getTranslation(locale: Locale): (key: string, params?: Record<string, string | number>) => string {
  // For server-side, we'd load translations differently
  // This is a simplified version
  return (key: string, params?: Record<string, string | number>) => {
    // In a real implementation, you'd load the translations from files
    let text = key
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), String(value))
      })
    }
    return text
  }
}
