/**
 * LinkSphere - CTA Section
 * Call to action section
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from '@/i18n/provider'

export function CTASection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[150px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary">{t('home.counters.available')}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
          {t('home.cta.title')}
        </h2>
        
        <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
          {t('home.cta.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/explore">
                {t('home.cta.button')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          <p className="text-white/40 text-sm">
            {t('pricing.from')} <span className="text-white font-medium">€1</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default CTASection
