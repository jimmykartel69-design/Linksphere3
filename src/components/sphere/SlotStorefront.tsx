/**
 * LinkSphere - Slot Storefront Component
 * Displays slot information like a store sign/enseigne
 */

'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  ExternalLink, 
  ShoppingCart, 
  MapPin, 
  Calendar, 
  Eye, 
  MousePointer,
  Tag,
  Globe,
  Building2,
  Sparkles,
  Check,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { BASE_SLOT_PRICE_EUR, USER_BADGES } from '@/lib/constants'

// Slot data interface
interface SlotData {
  id: string
  slotNumber: number
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DISABLED'
  title?: string
  description?: string
  targetUrl?: string
  logoUrl?: string
  bannerUrl?: string
  category?: {
    name: string
    icon: string
    color: string
  }
  owner?: {
    name: string
    avatarUrl?: string
    badge?: string
  }
  purchasedAt?: string
  price?: number
  viewCount?: number
  clickCount?: number
}

// Format number
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Get badge info
function getBadgeInfo(badge: string) {
  return USER_BADGES[badge as keyof typeof USER_BADGES] || USER_BADGES.NONE
}

interface SlotStorefrontProps {
  slotNumber: number | null
  slotData: SlotData | null
  isLoading?: boolean
  onClose: () => void
  onBuy?: () => void
}

export function SlotStorefront({ 
  slotNumber, 
  slotData, 
  isLoading = false,
  onClose, 
  onBuy 
}: SlotStorefrontProps) {
  // Derived state using useMemo
  const isAvailable = useMemo(() => !slotData || slotData.status === 'AVAILABLE', [slotData])
  const isSold = useMemo(() => slotData?.status === 'SOLD', [slotData])
  const isReserved = useMemo(() => slotData?.status === 'RESERVED', [slotData])
  const isDisabled = useMemo(() => slotData?.status === 'DISABLED', [slotData])
  
  // Don't render if no slot selected
  if (!slotNumber) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md z-50 pointer-events-auto"
      >
        <div className="h-full bg-gradient-to-b from-gray-900 to-black border-l border-white/10 shadow-2xl overflow-y-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          {isLoading ? (
            // Loading state
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/60">Chargement du slot...</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Banner/Header */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-green-900/30 overflow-hidden">
                {slotData?.bannerUrl ? (
                  <img 
                    src={slotData.bannerUrl} 
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                        <span className="text-3xl font-bold text-primary">
                          #{slotNumber.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-white/40 text-sm">Slot #{formatNumber(slotNumber)}</p>
                    </div>
                  </div>
                )}
                
                {/* Status badge */}
                <div className="absolute top-4 left-4">
                  {isAvailable && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Disponible
                    </Badge>
                  )}
                  {isSold && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      <Building2 className="w-3 h-3 mr-1" />
                      Occupé
                    </Badge>
                  )}
                  {isReserved && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Réservé
                    </Badge>
                  )}
                  {isDisabled && (
                    <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
                      Gris / Indisponible
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Logo & Title */}
              <div className="relative px-6 -mt-10">
                <div className="flex items-end gap-4">
                  {/* Logo */}
                  <div className="w-20 h-20 rounded-xl bg-gray-800 border-2 border-white/10 overflow-hidden shadow-lg">
                    {slotData?.logoUrl ? (
                      <img src={slotData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20">
                        <Tag className="w-8 h-8 text-primary" />
                      </div>
                    )}
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1 pb-2">
                    <h2 className="text-xl font-bold text-white">
                      {slotData?.title || `Slot #${formatNumber(slotNumber)}`}
                    </h2>
                    {slotData?.category && (
                      <p className="text-white/50 text-sm flex items-center gap-1">
                        <span>{slotData.category.icon}</span>
                        {slotData.category.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
                {/* Description */}
                {slotData?.description && (
                  <div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {slotData.description}
                    </p>
                  </div>
                )}
                
                {/* Owner info for sold slots */}
                {isSold && slotData?.owner && (
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                          {slotData.owner.avatarUrl ? (
                            <img src={slotData.owner.avatarUrl} alt="Owner" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/20">
                              <span className="text-primary font-bold">
                                {slotData.owner.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{slotData.owner.name}</p>
                          {slotData.owner.badge && (
                            <p className="text-xs text-amber-400">
                              {getBadgeInfo(slotData.owner.badge).icon} {getBadgeInfo(slotData.owner.badge).name}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Separator className="bg-white/10" />
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                      <Eye className="w-3 h-3" />
                      Vues
                    </div>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(slotData?.viewCount || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                      <MousePointer className="w-3 h-3" />
                      Clics
                    </div>
                    <p className="text-lg font-bold text-white">
                      {formatNumber(slotData?.clickCount || 0)}
                    </p>
                  </div>
                </div>
                
                {/* Target URL */}
                {slotData?.targetUrl && (
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2 text-white/50 text-xs mb-1">
                      <Globe className="w-3 h-3" />
                      Lien
                    </div>
                    <a 
                      href={slotData.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm hover:underline truncate block"
                    >
                      {slotData.targetUrl}
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </a>
                  </div>
                )}
                
                {/* Purchase info */}
                {isSold && slotData?.purchasedAt && (
                  <div className="p-3 rounded-lg bg-white/5 flex items-center gap-2 text-white/60 text-sm">
                    <Calendar className="w-4 h-4" />
                    Acquis le {formatDate(slotData.purchasedAt)}
                  </div>
                )}
                
                {/* Position info */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-green-900/20 border border-primary/20">
                  <div className="flex items-center gap-2 text-primary text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    Position sur la Sphère
                  </div>
                  <div className="text-3xl font-bold text-white font-mono">
                    #{formatNumber(slotNumber)}
                  </div>
                  <p className="text-white/40 text-xs mt-1">
                    Propriété sur la planète marketplace (1,000,000 emplacements)
                  </p>
                </div>
              </div>
              
              {/* Footer / Actions */}
              <div className="p-6 border-t border-white/10 bg-black/50">
                {isAvailable ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Prix</span>
                      <span className="text-2xl font-bold text-primary">
                        €{BASE_SLOT_PRICE_EUR}
                      </span>
                    </div>
                    <Button 
                      className="w-full h-12 text-lg"
                      onClick={onBuy}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Acheter ce slot
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                    <p className="text-center text-white/40 text-xs">
                      Paiement unique • Propriété à vie
                    </p>
                  </div>
                ) : isSold ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-amber-400 mb-2">
                      <Check className="w-5 h-5" />
                      Cette propriété est déjà vendue
                    </div>
                    <Button variant="outline" className="w-full border-white/10 text-white">
                      Chercher un autre slot
                    </Button>
                  </div>
                ) : isDisabled ? (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
                      <Sparkles className="w-5 h-5" />
                      Emplacement grisé, indisponible à l'achat
                    </div>
                    <Button variant="outline" className="w-full border-white/10 text-white">
                      Voir d'autres propriétés
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-yellow-400 mb-2">
                      <Sparkles className="w-5 h-5" />
                      Ce slot est réservé
                    </div>
                    <Button variant="outline" className="w-full border-white/10 text-white">
                      Voir d'autres slots
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SlotStorefront
