/**
 * LinkSphere - Pricing Section
 * Tiered pricing cards
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Crown, Building2, Sparkles } from 'lucide-react'

// Pricing tiers data
const pricingTiers = [
  {
    id: 'single',
    name: 'Slot Unique',
    price: 1,
    currency: '€',
    period: 'paiement unique',
    description: 'Idéal pour découvrir LinkSphere',
    icon: Sparkles,
    popular: false,
    features: [
      { text: '1 emplacement sur la Sphère 3D', included: true },
      { text: 'Propriété à vie', included: true },
      { text: 'Titre personnalisé (50 car.)', included: true },
      { text: 'Description (200 car.)', included: true },
      { text: 'Lien cliquable', included: true },
      { text: 'Logo 200x200px', included: true },
      { text: 'Choix de catégorie', included: true },
      { text: 'Visibilité mondiale 24/7', included: true },
      { text: 'Analytics de base', included: true },
      { text: 'Support email', included: true },
      { text: 'Badge Multi-Propriétaire', included: false },
      { text: 'Bannière personnalisée', included: false },
      { text: 'Support prioritaire', included: false },
      { text: 'API Access', included: false },
    ],
    cta: 'Acheter',
    href: '/explore',
  },
  {
    id: 'pack10',
    name: 'Pack 10 Slots',
    price: 9,
    originalPrice: 10,
    currency: '€',
    period: 'paiement unique',
    description: '10% de réduction - Pour les entrepreneurs',
    icon: Star,
    popular: true,
    discount: '10%',
    features: [
      { text: '10 emplacements sur la Sphère 3D', included: true },
      { text: 'Propriété à vie', included: true },
      { text: 'Titre personnalisé (50 car.)', included: true },
      { text: 'Description (200 car.)', included: true },
      { text: 'Liens uniques par slot', included: true },
      { text: 'Logo 200x200px', included: true },
      { text: 'Multi-catégories possible', included: true },
      { text: 'Visibilité mondiale 24/7', included: true },
      { text: 'Analytics détaillés', included: true },
      { text: 'Badge "Multi-Propriétaire"', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'Bannière personnalisée', included: false },
      { text: 'API Access', included: false },
      { text: 'Account Manager', included: false },
    ],
    cta: 'Choisir ce pack',
    href: '/checkout?pack=10',
  },
  {
    id: 'pack50',
    name: 'Pack 50 Slots',
    price: 40,
    originalPrice: 50,
    currency: '€',
    period: 'paiement unique',
    description: '20% de réduction - Pour les entreprises',
    icon: Crown,
    popular: false,
    discount: '20%',
    features: [
      { text: '50 emplacements sur la Sphère 3D', included: true },
      { text: 'Propriété à vie', included: true },
      { text: 'Titre personnalisé (50 car.)', included: true },
      { text: 'Description (200 car.)', included: true },
      { text: 'Liens uniques par slot', included: true },
      { text: 'Logo 200x200px', included: true },
      { text: 'Stratégie multi-catégories', included: true },
      { text: 'Visibilité mondiale 24/7', included: true },
      { text: 'Analytics avancés + rapports', included: true },
      { text: 'Badge "Investisseur"', included: true },
      { text: 'Bannière 1200x630px', included: true },
      { text: 'Support VIP dédié', included: true },
      { text: 'API Access', included: false },
      { text: 'Account Manager', included: false },
    ],
    cta: 'Choisir ce pack',
    href: '/checkout?pack=50',
  },
  {
    id: 'enterprise',
    name: 'Pack Enterprise',
    price: null,
    currency: '',
    period: 'sur mesure',
    description: '100+ slots - Solution personnalisée',
    icon: Building2,
    popular: false,
    features: [
      { text: '100+ emplacements', included: true },
      { text: 'Propriété à vie', included: true },
      { text: 'Toutes les fonctionnalités', included: true },
      { text: 'Prix négocié jusqu\'à -30%', included: true },
      { text: 'Account Manager dédié', included: true },
      { text: 'API Access complet', included: true },
      { text: 'Zones exclusives', included: true },
      { text: 'Statistiques temps réel', included: true },
      { text: 'Export de données (CSV/API)', included: true },
      { text: 'SLA garanti 99.9%', included: true },
      { text: 'Intégration sur mesure', included: true },
      { text: 'Formation équipe', included: true },
      { text: 'Webhooks personnalisés', included: true },
      { text: 'Support 24/7', included: true },
    ],
    cta: 'Nous contacter',
    href: 'mailto:enterprise@linksphere.com',
  },
]

export function PricingSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier) => {
            const Icon = tier.icon
            return (
              <Card
                key={tier.id}
                className={`relative bg-white/5 border-white/10 flex flex-col ${
                  tier.popular
                    ? 'ring-2 ring-primary bg-primary/5'
                    : ''
                }`}
              >
                {/* Popular badge */}
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      Plus Populaire
                    </Badge>
                  </div>
                )}

                {/* Discount badge */}
                {tier.discount && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="bg-green-500/20 text-green-400 border-0">
                      -{tier.discount}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    tier.popular ? 'bg-primary/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-6 h-6 ${tier.popular ? 'text-primary' : 'text-white/60'}`} />
                  </div>
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <p className="text-white/40 text-sm">{tier.description}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  {/* Price */}
                  <div className="text-center mb-6">
                    {tier.price !== null ? (
                      <>
                        {tier.originalPrice && (
                          <span className="text-white/40 line-through text-lg mr-2">
                            {tier.currency}{tier.originalPrice}
                          </span>
                        )}
                        <span className="text-4xl font-bold text-white">
                          {tier.currency}{tier.price}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-white">Sur Devis</span>
                    )}
                    <p className="text-white/40 text-sm mt-1">{tier.period}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-5 h-5 shrink-0 mt-0.5 flex items-center justify-center text-white/20">—</span>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-white/70' : 'text-white/30'}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button
                    className={`w-full ${tier.popular ? '' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                    variant={tier.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href={tier.href}>
                      {tier.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/40 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Paiement sécurisé Stripe
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Satisfaction garantie
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Support réactif
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Aucun abonnement
          </div>
        </div>
      </div>
    </section>
  )
}
