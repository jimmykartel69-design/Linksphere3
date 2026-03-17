/**
 * LinkSphere - Slot Detail Page
 * Public page for individual slot
 */

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ExternalLink, 
  Eye, 
  MousePointer, 
  Calendar, 
  Globe, 
  Tag,
  MapPin,
  ShoppingCart,
  Share2
} from 'lucide-react'
import { TOTAL_SLOTS, SLOT_STATUS_COLORS, BASE_SLOT_PRICE_EUR } from '@/lib/constants'

// Format number
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

// Get slot data - all slots are available
function getSlot(slotNumber: number) {
  if (slotNumber < 1 || slotNumber > TOTAL_SLOTS) return null
  
  return {
    slotNumber,
    status: 'AVAILABLE',
    title: null,
    description: null,
    targetUrl: null,
    logoUrl: null,
    bannerUrl: null,
    category: null,
    country: null,
    language: 'English',
    purchasedAt: null,
    viewCount: Math.floor(Math.random() * 100),
    clickCount: Math.floor(Math.random() * 10),
  }
}

export async function generateStaticParams() {
  // Pre-render some popular slots
  return [
    { id: '1' },
    { id: '100' },
    { id: '1000' },
    { id: '10000' },
    { id: '100000' },
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slotNumber = parseInt(id)
  const slot = getSlot(slotNumber)
  
  if (!slot) {
    return { title: 'Slot Not Found | LinkSphere' }
  }

  return {
    title: `Slot #${formatNumber(slotNumber)} - Available | LinkSphere`,
    description: `Slot #${formatNumber(slotNumber)} is available for purchase on LinkSphere. Own your place in the digital universe.`,
    openGraph: {
      title: `Slot #${formatNumber(slotNumber)}`,
      description: 'Available for purchase on LinkSphere',
      type: 'website',
    },
  }
}

export default async function SlotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const slotNumber = parseInt(id)
  const slot = getSlot(slotNumber)

  if (!slot) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 pt-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-white/40 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/explore" className="hover:text-white">Explore</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Slot #{formatNumber(slotNumber)}</span>
          </nav>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">
                    Slot #{formatNumber(slotNumber)}
                  </h1>
                  <Badge 
                    style={{ backgroundColor: SLOT_STATUS_COLORS.AVAILABLE }}
                    className="text-white"
                  >
                    Available
                  </Badge>
                </div>
                <p className="text-white/60">
                  Position #{formatNumber(slotNumber)} of {formatNumber(TOTAL_SLOTS)} on the LinkSphere
                </p>
              </div>

              {/* Banner placeholder */}
              <div className="aspect-[2/1] rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-green-500/40 mx-auto mb-2" />
                  <p className="text-green-400/60">This slot is available for purchase</p>
                </div>
              </div>

              {/* Stats */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Preview Statistics</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{formatNumber(slot.viewCount)}</p>
                        <p className="text-sm text-white/40">Views</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <MousePointer className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{formatNumber(slot.clickCount)}</p>
                        <p className="text-sm text-white/40">Clicks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* Purchase card */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-4">
                  <div className="text-center">
                    <p className="text-white/60 text-sm">Price</p>
                    <p className="text-4xl font-bold text-white">€{BASE_SLOT_PRICE_EUR}</p>
                    <p className="text-white/40 text-sm">One-time payment</p>
                  </div>
                  <Button className="w-full" size="lg" asChild>
                    <Link href={`/checkout?slot=${slotNumber}`}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Slot
                    </Link>
                  </Button>
                  <p className="text-xs text-white/40 text-center">
                    Permanent ownership • No renewals
                  </p>
                  
                  <Separator className="bg-white/10" />
                  
                  <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Slot
                  </Button>
                </CardContent>
              </Card>

              {/* Details card */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Details</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-white/40" />
                      <span className="text-white/60">Language:</span>
                      <span className="text-white">{slot.language}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
