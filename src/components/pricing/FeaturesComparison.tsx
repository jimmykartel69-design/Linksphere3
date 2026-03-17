/**
 * LinkSphere - Features Comparison Table
 * Detailed feature comparison across all tiers
 */

'use client'

import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

// Features comparison data
const featureCategories = [
  {
    category: '🌐 Expérience Visuelle',
    features: [
      { name: 'Emplacements sur la Sphère 3D', single: '1', pack10: '10', pack50: '50', enterprise: '100+' },
      { name: 'Propriété à vie', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Visibilité mondiale 24/7', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Navigation interactive', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Recherche de slot', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Filtres par catégorie', single: true, pack10: true, pack50: true, enterprise: true },
    ],
  },
  {
    category: '🏷️ Personnalisation',
    features: [
      { name: 'Titre personnalisé (50 car.)', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Description (200 car.)', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'URL de destination', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Logo/Image (200x200px)', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Bannière (1200x630px)', single: false, pack10: false, pack50: true, enterprise: true },
      { name: 'Modification post-achat', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'QR Code généré', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Choix de catégorie', single: '1', pack10: 'Multiple', pack50: 'Multiple', enterprise: 'Multiple' },
    ],
  },
  {
    category: '📊 Analytics & Suivi',
    features: [
      { name: 'Compteur de vues', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Compteur de clics', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Taux de clic (CTR)', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Historique', single: '30 jours', pack10: '90 jours', pack50: '365 jours', enterprise: 'Illimité' },
      { name: 'Graphiques visuels', single: 'Basique', pack10: 'Détaillé', pack50: 'Avancé', enterprise: 'Pro' },
      { name: 'Export CSV', single: false, pack10: false, pack50: true, enterprise: true },
      { name: 'Rapport mensuel email', single: false, pack10: true, pack50: true, enterprise: true },
      { name: 'Statistiques temps réel', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'Heatmap', single: false, pack10: false, pack50: false, enterprise: true },
    ],
  },
  {
    category: '🔐 Gestion de Compte',
    features: [
      { name: 'Tableau de bord', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Multi-slots', single: false, pack10: true, pack50: true, enterprise: true },
      { name: 'Historique d\'achats', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Factures PDF', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Profil public', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Badge utilisateur', single: '-', pack10: 'Multi-Propriétaire', pack50: 'Investisseur', enterprise: 'Enterprise' },
      { name: 'Authentification 2FA', single: true, pack10: true, pack50: true, enterprise: true },
    ],
  },
  {
    category: '🌍 Internationalisation',
    features: [
      { name: '4 langues (EN, FR, ES, DE)', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Détection auto langue', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Checkout localisé', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Devises (EUR, USD, GBP)', single: true, pack10: true, pack50: true, enterprise: true },
    ],
  },
  {
    category: '💳 Paiement & Support',
    features: [
      { name: 'Paiement sécurisé SSL', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Carte bancaire', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Apple Pay / Google Pay', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Confirmation instantanée', single: true, pack10: true, pack50: true, enterprise: true },
      { name: 'Support', single: 'Email', pack10: 'Prioritaire', pack50: 'VIP', enterprise: 'Dédié 24/7' },
    ],
  },
  {
    category: '🚀 Premium',
    features: [
      { name: 'Zones stratégiques', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'Mise en avant', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'API Access', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'Webhooks', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'Account Manager', single: false, pack10: false, pack50: false, enterprise: true },
      { name: 'SLA garanti', single: false, pack10: false, pack50: false, enterprise: '99.9%' },
    ],
  },
]

// Helper to render value
function renderValue(value: boolean | string) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-400 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-white/20 mx-auto" />
    )
  }
  return <span className="text-white/70 text-sm">{value}</span>
}

export function FeaturesComparison() {
  return (
    <section className="py-16 px-4 bg-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Comparaison Complète des Fonctionnalités
          </h2>
          <p className="text-white/60">
            Tout ce que vous devez savoir avant d'investir
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left p-4 text-white font-medium border-b border-white/10">
                  Fonctionnalité
                </th>
                <th className="p-4 text-center border-b border-white/10">
                  <div className="text-white font-medium">Slot Unique</div>
                  <div className="text-primary font-bold">€1</div>
                </th>
                <th className="p-4 text-center border-b border-white/10 bg-primary/5">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-white font-medium">Pack 10</span>
                    <Badge className="bg-primary text-xs">Populaire</Badge>
                  </div>
                  <div className="text-primary font-bold">€9</div>
                </th>
                <th className="p-4 text-center border-b border-white/10">
                  <div className="text-white font-medium">Pack 50</div>
                  <div className="text-primary font-bold">€40</div>
                </th>
                <th className="p-4 text-center border-b border-white/10">
                  <div className="text-white font-medium">Enterprise</div>
                  <div className="text-primary font-bold">Sur devis</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {featureCategories.map((category, catIdx) => (
                <Fragment key={`cat-group-${catIdx}`}>
                  {/* Category header */}
                  <tr className="bg-white/5">
                    <td
                      colSpan={5}
                      className="p-3 text-white/80 font-medium border-b border-white/10"
                    >
                      {category.category}
                    </td>
                  </tr>
                  {/* Features */}
                  {category.features.map((feature, featIdx) => (
                    <tr
                      key={`feat-${catIdx}-${featIdx}`}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 text-white/70 text-sm">
                        {feature.name}
                      </td>
                      <td className="p-4 text-center">
                        {renderValue(feature.single)}
                      </td>
                      <td className="p-4 text-center bg-primary/5">
                        {renderValue(feature.pack10)}
                      </td>
                      <td className="p-4 text-center">
                        {renderValue(feature.pack50)}
                      </td>
                      <td className="p-4 text-center">
                        {renderValue(feature.enterprise)}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
