/**
 * LinkSphere - Explore Page
 * Interactive 3D sphere explorer with slot search and storefront
 */

'use client'

import { useState, useCallback, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { SlotStorefront } from '@/components/sphere/SlotStorefront'
import { SlotSearch } from '@/components/sphere/SlotSearch'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Globe, 
  Info, 
  ChevronLeft,
  Menu,
} from 'lucide-react'
import { TOTAL_SLOTS, BASE_SLOT_PRICE_EUR } from '@/lib/constants'
import { useTranslation } from '@/i18n/provider'

// Dynamic import for 3D component (no SSR)
const Sphere3D = dynamic(
  () => import('@/components/sphere/Sphere3D').then(mod => mod.Sphere3D),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading sphere...</p>
        </div>
      </div>
    )
  }
)

// Format number
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Loading fallback
function ExploreLoading() {
  const { t } = useTranslation()

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">{t('loading')}</h2>
          <p className="text-white/60">{t('explore.subtitle')}</p>
        </div>
      </div>
      <Footer />
    </main>
  )
}

// Explore content
function ExploreContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSlot = searchParams.get('slot')
  
  const [selectedSlot, setSelectedSlot] = useState<number | null>(
    initialSlot ? parseInt(initialSlot) : null
  )
  const [slotData, setSlotData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showStorefront, setShowStorefront] = useState(false)
  const [stats, setStats] = useState({
    totalSlots: TOTAL_SLOTS,
    availableSlots: TOTAL_SLOTS,
    soldSlots: 0,
    reservedSlots: 0,
    disabledSlots: 0,
  })

  useEffect(() => {
    let cancelled = false
    const loadStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setStats({
          totalSlots: data.totalSlots || TOTAL_SLOTS,
          availableSlots: data.availableSlots || 0,
          soldSlots: data.soldSlots || 0,
          reservedSlots: data.reservedSlots || 0,
          disabledSlots: data.disabledSlots || 0,
        })
      } catch {
        // Keep defaults
      }
    }
    loadStats()
    const intervalId = window.setInterval(loadStats, 30000)
    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [])
  
  // Handle slot selection
  const handleSlotSelect = useCallback((slotNumber: number) => {
    setSelectedSlot(slotNumber)
    setShowStorefront(true)
    
    // Fetch slot data
    setIsLoading(true)
    fetch(`/api/slots/${slotNumber}`)
      .then(res => res.json())
      .then(data => {
        if (!data.slot) {
          setSlotData(null)
          return
        }

        const slot = data.slot
        setSlotData({
          ...slot,
          slotNumber: slot.slot_number,
          targetUrl: slot.target_url,
          logoUrl: slot.logo_url,
          bannerUrl: slot.banner_url,
          purchasedAt: slot.purchased_at,
          price: slot.purchase_price,
          viewCount: slot.view_count,
          clickCount: slot.click_count,
          owner: slot.owner
            ? {
                ...slot.owner,
                avatarUrl: slot.owner.avatar_url,
              }
            : undefined,
        })
      })
      .catch(() => {
        setSlotData(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])
  
  // Handle slot search
  const handleSlotFound = useCallback((slotNumber: number) => {
    handleSlotSelect(slotNumber)
  }, [handleSlotSelect])
  
  // Handle buy
  const handleBuy = useCallback(() => {
    if (selectedSlot) {
      router.push(`/checkout?slot=${selectedSlot}`)
    }
  }, [selectedSlot, router])
  
  // Close storefront
  const handleCloseStorefront = useCallback(() => {
    setShowStorefront(false)
  }, [])
  
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      {/* Main content area */}
      <div className="flex-1 pt-16 relative">
        {/* 3D Canvas - Full screen */}
        <div className="absolute inset-0">
          <Sphere3D 
            selectedSlot={selectedSlot}
            onSlotClick={handleSlotSelect}
          />
        </div>
        
        {/* Gradient overlays for readability */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </div>
        
        {/* Top bar with search */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-start gap-4">
          {/* Left panel - collapsible */}
          <div className={`${showSidebar ? 'w-80' : 'w-auto'} transition-all duration-300`}>
            {showSidebar ? (
              <Card className="bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl">
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        LinkSphere
                      </h1>
                      <p className="text-white/50 text-sm">
                        Planet marketplace • {formatNumber(stats.totalSlots)} {t('home.counters.slots').toLowerCase()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(false)}
                      className="text-white/50 hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Search */}
                  <SlotSearch 
                    onSlotFound={handleSlotFound}
                    currentSlot={selectedSlot}
                  />
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-lg font-bold text-primary">{formatNumber(stats.totalSlots)}</div>
                      <div className="text-xs text-white/50">{t('home.counters.slots')}</div>
                      
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-lg font-bold text-green-400">{formatNumber(stats.availableSlots)}</div>
                      <div className="text-xs text-white/50">{t('home.counters.available')}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/5 text-center">
                      <div className="text-lg font-bold text-blue-400">{formatNumber(stats.soldSlots)}</div>
                      <div className="text-xs text-white/50">{t('home.counters.sold')}</div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-xs text-white/70">
                        Explore, visit and buy properties on the planet marketplace from €{BASE_SLOT_PRICE_EUR}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick links */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-white/10 text-white"
                      onClick={() => router.push('/pricing')}
                    >
                      {t('nav.pricing')}
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => router.push('/auth/register')}
                    >
                      {t('nav.register')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowSidebar(true)}
                className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Right side - current slot info */}
          {selectedSlot && !showStorefront && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ml-auto"
            >
              <Card className="bg-black/80 backdrop-blur-xl border-white/10">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">
                      #{selectedSlot > 999 ? `${Math.floor(selectedSlot/1000)}k` : selectedSlot}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">Slot #{formatNumber(selectedSlot)}</p>
                    <p className="text-white/50 text-xs">Marketplace property</p>
                  </div>
                  <Button size="sm" onClick={() => setShowStorefront(true)}>
                    {t('slot.buyNow')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Bottom info bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <Card className="bg-black/60 backdrop-blur-xl border-white/10">
            <CardContent className="px-4 py-2 flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-white/60">{t('explore.legend.available')}</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-white/60">{t('explore.legend.sold')}</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className="text-white/60">Gris / indisponible</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <div className="text-sm text-white/40">
                {formatNumber(stats.availableSlots)} free • {formatNumber(stats.soldSlots)} sold • {formatNumber(stats.disabledSlots)} gray
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Slot Storefront Panel */}
      {showStorefront && (
        <SlotStorefront
          slotNumber={selectedSlot}
          slotData={slotData}
          isLoading={isLoading}
          onClose={handleCloseStorefront}
          onBuy={handleBuy}
        />
      )}
      
      <Footer />
    </main>
  )
}

// Export with Suspense
export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreLoading />}>
      <ExploreContent />
    </Suspense>
  )
}
