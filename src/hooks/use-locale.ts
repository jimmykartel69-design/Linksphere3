/**
 * useLocale Hook
 * Language and locale management
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, LOCALE_NAMES } from '@/lib/constants'

type Locale = typeof SUPPORTED_LOCALES[number]

interface UseLocaleReturn {
  locale: Locale
  setLocale: (locale: Locale) => void
  localeName: string
  supportedLocales: typeof SUPPORTED_LOCALES
  localeNames: typeof LOCALE_NAMES
}

const STORAGE_KEY = 'linksphere_locale'

function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const browserLang = navigator.language.split('-')[0]
  
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) {
    return browserLang as Locale
  }

  return DEFAULT_LOCALE
}

function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      return stored as Locale
    }
  } catch {
    // Ignore storage errors
  }

  return null
}

function storeLocale(locale: Locale): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // Ignore storage errors
  }
}

export function useLocale(): UseLocaleReturn {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // First check stored preference
    const stored = getStoredLocale()
    if (stored) return stored

    // Then detect from browser
    return detectBrowserLocale()
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    storeLocale(newLocale)

    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  }, [])

  // Update document lang on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
    }
  }, [locale])

  return {
    locale,
    setLocale,
    localeName: LOCALE_NAMES[locale] || locale,
    supportedLocales: SUPPORTED_LOCALES,
    localeNames: LOCALE_NAMES,
  }
}
