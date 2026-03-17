/**
 * LinkSphere - Checkout Success Page
 * Displays Stripe purchase confirmation + order number.
 */

'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, ArrowRight, Package, Loader2, Hash } from 'lucide-react'
import { buildOrderNumber } from '@/lib/order'

type Purchase = {
  id: string
  pack_size: number
  pack_name: string | null
  amount: number
  currency: string
  status: string
  purchased_at: string | null
  created_at: string
  order_number?: string
}

function SuccessLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-lg w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Loading confirmation...</h2>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </main>
  )
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const fallbackPackSize = Number(searchParams.get('pack') || 1)

  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [purchasedSlots, setPurchasedSlots] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const loadPurchase = async () => {
      try {
        if (!sessionId) return
        const res = await fetch(`/api/purchases?sessionId=${encodeURIComponent(sessionId)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const firstPurchase = (data.purchases || [])[0] || null
        setPurchase(firstPurchase)
        setPurchasedSlots(data.purchasedSlots || [])
      } catch {
        // Keep fallback UI.
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    loadPurchase()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  const orderNumber = useMemo(() => {
    if (purchase?.order_number) return purchase.order_number
    if (purchase?.id) return buildOrderNumber(purchase.id, purchase.purchased_at || purchase.created_at)
    return null
  }, [purchase])

  const packSize = purchase?.pack_size || fallbackPackSize

  if (isLoading) {
    return <SuccessLoading />
  }

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />

      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-xl w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Purchase Confirmed</h1>
            <p className="text-white/60 mb-6">Stripe payment received successfully.</p>

            <div className="bg-white/5 rounded-lg p-4 mb-6 text-left space-y-2">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-white font-medium">
                  {purchase?.pack_name || `Pack ${packSize} Slots`}
                </span>
              </div>

              {orderNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Order number</span>
                  <span className="text-white flex items-center gap-1">
                    <Hash className="w-4 h-4 text-primary" />
                    {orderNumber}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Slots purchased</span>
                <span className="text-white">{packSize}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Amount</span>
                <span className="text-white">€{purchase?.amount ?? '-'}</span>
              </div>
            </div>

            {purchasedSlots.length > 0 && (
              <div className="mb-6 text-left">
                <p className="text-white/70 text-sm mb-2">Your new properties:</p>
                <div className="flex flex-wrap gap-2">
                  {purchasedSlots.map((slotNumber) => (
                    <Link
                      key={slotNumber}
                      href={`/explore?slot=${slotNumber}`}
                      className="px-3 py-1.5 rounded-md bg-primary/15 text-primary hover:bg-primary/25 text-sm"
                    >
                      #{slotNumber.toLocaleString('en-US')}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6 text-left">
              <p className="text-blue-300 text-sm">
                Your properties are now assigned to your account and visible in your dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-white" asChild>
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/explore">
                  Visit Planet
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessContent />
    </Suspense>
  )
}

