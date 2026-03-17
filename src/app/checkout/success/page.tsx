/**
 * LinkSphere - Checkout Success Page
 * Displayed after successful Stripe payment
 */

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowRight, Package, Loader2 } from 'lucide-react'
import { USER_BADGES } from '@/lib/constants'

// Get badge info from slots
function getBadgeInfo(slots: number) {
  if (slots >= 100) return USER_BADGES.ENTERPRISE
  if (slots >= 50) return USER_BADGES.INVESTOR
  if (slots >= 10) return USER_BADGES.MULTI_OWNER
  if (slots >= 1) return USER_BADGES.OWNER
  return USER_BADGES.NONE
}

// Helper to get initial purchase data from localStorage (client-side only)
function getInitialPurchaseData() {
  if (typeof window === 'undefined') return null
  const pending = localStorage.getItem('pendingPurchase')
  if (pending) {
    try {
      const data = JSON.parse(pending)
      // Clear the pending purchase
      localStorage.removeItem('pendingPurchase')
      return data
    } catch {
      return null
    }
  }
  return null
}

// Loading fallback
function SuccessLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-lg w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Chargement...</h2>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

// Main content
function SuccessContent() {
  const searchParams = useSearchParams()
  const packSize = parseInt(searchParams.get('pack') || '1')
  
  // Get purchase data synchronously (only runs on client)
  const purchaseData = getInitialPurchaseData()
  const badgeInfo = getBadgeInfo(packSize)

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-lg w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Merci pour votre achat!
            </h1>
            <p className="text-white/60 mb-6">
              Votre paiement a été traité avec succès.
            </p>

            {/* Purchase details */}
            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">
                  {purchaseData?.packName || `Pack ${packSize} Slots`}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Slots achetés</span>
                  <span className="text-white">{packSize}</span>
                </div>
                {purchaseData?.title && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Titre</span>
                    <span className="text-white">{purchaseData.title}</span>
                  </div>
                )}
                {purchaseData?.email && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Facture envoyée à</span>
                    <span className="text-white">{purchaseData.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Badge earned */}
            {packSize >= 10 && badgeInfo && (
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
                <p className="text-amber-400 font-medium mb-1">
                  {badgeInfo.icon} Badge débloqué!
                </p>
                <p className="text-amber-400/70 text-sm">
                  Vous êtes maintenant un <strong>{badgeInfo.name}</strong>
                </p>
              </div>
            )}

            {/* Info */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6 text-left">
              <p className="text-blue-400 text-sm">
                📧 Une confirmation avec votre facture a été envoyée à votre email.
                Vos slots seront activés dans les prochaines minutes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-white" asChild>
                <Link href="/dashboard">
                  Mon Dashboard
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/explore">
                  Explorer la Sphère
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </main>
  )
}

// Export with Suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  )
}
