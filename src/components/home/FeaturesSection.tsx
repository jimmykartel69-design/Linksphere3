/**
 * LinkSphere - Features Section
 * Comprehensive platform features showcase
 */

'use client'

import { 
  Globe2, 
  Zap, 
  Shield, 
  BarChart3, 
  Palette, 
  Clock,
  MousePointer,
  Sparkles,
  Languages,
  CreditCard,
  QrCode,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const featureCategories = [
  {
    category: '🌐 Expérience Visuelle',
    features: [
      {
        icon: Globe2,
        title: 'Sphère 3D Interactive',
        description: 'Navigatez dans un univers digital avec 1 million de slots.',
        color: 'from-green-500 to-emerald-500',
      },
      {
        icon: MousePointer,
        title: 'Zoom Infini',
        description: 'De la vue d\'ensemble au détail de chaque slot.',
        color: 'from-cyan-500 to-blue-500',
      },
      {
        icon: Sparkles,
        title: 'Animations Fluides',
        description: 'Rotation automatique et contrôles intuitifs.',
        color: 'from-purple-500 to-pink-500',
      },
    ],
  },
  {
    category: '🏷️ Personnalisation',
    features: [
      {
        icon: Palette,
        title: 'Logo & Couleurs',
        description: 'Upload votre logo 200x200px et personnalisez.',
        color: 'from-rose-500 to-red-500',
      },
      {
        icon: FileText,
        title: 'Titre & Description',
        description: '50 caractères pour le titre, 200 pour la description.',
        color: 'from-amber-500 to-orange-500',
      },
      {
        icon: QrCode,
        title: 'QR Code Généré',
        description: 'Partagez votre slot directement via QR code.',
        color: 'from-indigo-500 to-violet-500',
      },
    ],
  },
  {
    category: '📊 Analytics',
    features: [
      {
        icon: BarChart3,
        title: 'Vues & Clics',
        description: 'Suivez les performances de vos slots en temps réel.',
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: TrendingUp,
        title: 'Taux de Clic (CTR)',
        description: 'Mesurez l\'efficacité de votre emplacement.',
        color: 'from-green-500 to-teal-500',
      },
      {
        icon: Clock,
        title: 'Historique 365 jours',
        description: 'Données complètes sur une année entière.',
        color: 'from-purple-500 to-indigo-500',
      },
    ],
  },
  {
    category: '🌍 International',
    features: [
      {
        icon: Languages,
        title: '4 Langues',
        description: 'English, Français, Español, Deutsch.',
        color: 'from-pink-500 to-rose-500',
      },
      {
        icon: CreditCard,
        title: 'Multi-Devises',
        description: 'EUR, USD, GBP pour le paiement.',
        color: 'from-yellow-500 to-amber-500',
      },
      {
        icon: Users,
        title: 'Visibilité Mondiale',
        description: 'Accessible depuis partout dans le monde.',
        color: 'from-teal-500 to-cyan-500',
      },
    ],
  },
]

const mainFeatures = [
  {
    icon: Shield,
    title: 'Propriété à Vie',
    description: 'Un seul paiement, votre slot est à vous pour toujours. Pas d\'abonnement, pas de renouvellement.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Installation Instantanée',
    description: 'Achetez et personnalisez votre slot en quelques minutes. Aucune compétence technique requise.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: BarChart3,
    title: 'Analytics Intégrés',
    description: 'Suivez les vues, clics et engagement avec un tableau de bord analytique détaillé.',
    color: 'from-purple-500 to-pink-500',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main features */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/20 text-primary border-0">
            Fonctionnalités
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Pourquoi Choisir LinkSphere?
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Une nouvelle plateforme de présence digitale conçue pour une visibilité durable
          </p>
        </div>

        {/* Top 3 main features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {mainFeatures.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/60 leading-relaxed">
                {feature.description}
              </p>
              
              {/* Hover glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
            </div>
          ))}
        </div>

        {/* Feature categories */}
        {featureCategories.map((category, catIdx) => (
          <div key={catIdx} className="mb-16">
            <h3 className="text-xl font-semibold text-white mb-6">
              {category.category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {category.features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div>
                      <h4 className="text-base font-semibold text-white mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-white/50 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Stats row */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-primary/20 border border-primary/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-white/50 text-sm">Slots Disponibles</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">€1</div>
              <div className="text-white/50 text-sm">Prix de Départ</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">∞</div>
              <div className="text-white/50 text-sm">Durée de Propriété</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-1">4</div>
              <div className="text-white/50 text-sm">Langues Supportées</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
