'use client'

import { useEffect } from 'react'
import { useTranslation } from '@/i18n/provider'
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/lib/constants'

export function LocaleSync() {
  const { locale, setLocale } = useTranslation()

  useEffect(() => {
    const bootstrapLocale = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          const profileLocale = data?.user?.locale
          if (profileLocale && SUPPORTED_LOCALES.includes(profileLocale)) {
            if (locale !== profileLocale) {
              await setLocale(profileLocale)
            }
            return
          }
        }
      } catch {
        // Ignore and fallback below.
      }

      try {
        const stored = localStorage.getItem('linksphere_locale')
        if (stored && SUPPORTED_LOCALES.includes(stored as typeof SUPPORTED_LOCALES[number])) {
          if (locale !== stored) {
            await setLocale(stored as typeof SUPPORTED_LOCALES[number])
          }
          return
        }
      } catch {
        // Ignore and fallback below.
      }

      if (locale !== DEFAULT_LOCALE) {
        await setLocale(DEFAULT_LOCALE)
      }
    }

    bootstrapLocale()
  }, [locale, setLocale])

  return null
}

export default LocaleSync

