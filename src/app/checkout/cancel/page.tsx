/**
 * LinkSphere - Checkout Cancel Page
 * Displayed when Stripe payment is cancelled
 */

'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, ArrowLeft, CreditCard } from 'lucide-react'

export default function CheckoutCancelPage() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        <Card className="max-w-lg w-full bg-white/5 border-white/10">
          <CardContent className="pt-8 text-center">
            {/* Cancel icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-red-500" />
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-2">
              Paiement annulé
            </h1>
            <p className="text-white/60 mb-6">
              Votre paiement a été annulé. Aucun montant n'a été débité.
            </p>

            {/* Info */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-6 text-left">
              <p className="text-white/70 text-sm">
                Si vous avez rencontré un problème lors du paiement, n'hésitez pas à nous contacter 
                ou à réessayer. Votre panier est toujours disponible.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-white" asChild>
                <Link href="/pricing">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour aux tarifs
                </Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/pricing">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Réessayer
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
