/**
 * LinkSphere - Features Section
 * Highlights key platform benefits
 */

'use client'

import { Globe, Radar, Infinity, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/i18n/provider'

const features = [
  {
    icon: Globe,
    titleKey: 'home.features.visibility.title',
    descKey: 'home.features.visibility.desc',
  },
  {
    icon: Radar,
    titleKey: 'home.features.global.title',
    descKey: 'home.features.global.desc',
  },
  {
    icon: Infinity,
    titleKey: 'home.features.permanent.title',
    descKey: 'home.features.permanent.desc',
  },
  {
    icon: BarChart3,
    titleKey: 'home.features.analytics.title',
    descKey: 'home.features.analytics.desc',
  },
] as const

export function FeaturesSection() {
  const { t } = useTranslation()

  return (
    <section className="py-24 bg-gradient-to-b from-black to-gray-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t('home.features.title')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <article
              key={feature.titleKey}
              className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold mb-2">{t(feature.titleKey)}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{t(feature.descKey)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
