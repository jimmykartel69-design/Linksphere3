/**
 * LinkSphere - Pricing Page
 * Tiered pricing with all features
 */

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PricingSection } from '@/components/pricing/PricingSection'
import { FeaturesComparison } from '@/components/pricing/FeaturesComparison'
import { FAQSection } from '@/components/home'

export default function PricingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 pt-16">
        {/* Hero */}
        <section className="py-16 px-4 text-center bg-gradient-to-b from-primary/10 to-transparent">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Investissez dans l'Univers Digital
            </h1>
            <p className="text-xl text-white/60 mb-6">
              Choisissez le pack qui correspond à votre stratégie de visibilité
            </p>
            <p className="text-white/40">
              Propriété à vie • Pas d'abonnement • Visibilité 24/7
            </p>
          </div>
        </section>

        {/* Pricing Tiers */}
        <PricingSection />

        {/* Features Comparison */}
        <FeaturesComparison />

        {/* FAQ */}
        <FAQSection />
      </div>

      <Footer />
    </main>
  )
}
