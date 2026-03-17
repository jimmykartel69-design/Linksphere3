/**
 * LinkSphere - Checkout Page
 * Slot purchase flow with Stripe Payment Links integration
 */

'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Loader2,
  ArrowLeft,
  Shield,
  Package,
  Sparkles,
  ExternalLink,
  LogIn
} from 'lucide-react'
import { BASE_SLOT_PRICE_EUR, TOTAL_SLOTS, USER_BADGES } from '@/lib/constants'

// Pack configurations
const PACK_CONFIGS = {
  1: { slots: 1, price: 1, discount: 0, name: 'Slot Unique' },
  10: { slots: 10, price: 9, discount: 10, name: 'Pack 10 Slots' },
  50: { slots: 50, price: 40, discount: 20, name: 'Pack 50 Slots' },
}

// Format number
function formatNumber(num: number): string {
  return num.toLocaleString('fr-FR')
}

// Get badge info from slots
function getBadgeInfo(slots: number) {
  if (slots >= 100) return USER_BADGES.ENTERPRISE
  if (slots >= 50) return USER_BADGES.INVESTOR
  if (slots >= 10) return USER_BADGES.MULTI_OWNER
  if (slots >= 1) return USER_BADGES.OWNER
  return USER_BADGES.NONE
}

// Loading fallback
function CheckoutLoading() {
  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      <div className="flex-1 flex items-center justify-center pt-16">
        <Card className="max-w-md w-full mx-4 bg-white/5 border-white/10">
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

// Main checkout content (uses useSearchParams)
function CheckoutContent() {
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<'details' | 'redirect'>('details')
  
  // Get pack or slot from URL
  const packSize = parseInt(searchParams.get('pack') || '0')
  const slotNumber = parseInt(searchParams.get('slot') || '0')
  
  // Determine pack config
  const packConfig = useMemo(() => {
    if (packSize && PACK_CONFIGS[packSize as keyof typeof PACK_CONFIGS]) {
      return PACK_CONFIGS[packSize as keyof typeof PACK_CONFIGS]
    }
    if (slotNumber) {
      return PACK_CONFIGS[1]
    }
    return PACK_CONFIGS[1] // Default to single slot
  }, [packSize, slotNumber])
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetUrl: '',
    categoryId: '',
    email: '',
  })

  const price = packConfig.price
  const originalPrice = packConfig.slots * BASE_SLOT_PRICE_EUR
  const savings = originalPrice - price
  const badgeInfo = getBadgeInfo(packConfig.slots)

  // Handle Stripe redirect
  const handlePayment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packSize: packConfig.slots,
          slotNumber: packConfig.slots === 1 ? slotNumber : undefined,
          title: formData.title,
          description: formData.description,
          targetUrl: formData.targetUrl,
          categoryId: formData.categoryId,
          email: formData.email,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login?redirectedFrom=/checkout'
          return
        }
        throw new Error(data.error || 'Checkout initialization failed')
      }

      if (!data.checkoutUrl) {
        throw new Error('No checkout URL returned')
      }

      setStep('redirect')
      window.location.href = data.checkoutUrl
    } catch (error) {
      setIsLoading(false)
      alert(error instanceof Error ? error.message : 'Erreur de paiement')
    }
  }

  // Redirect state
  if (step === 'redirect') {
    return (
      <main className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-16">
          <Card className="max-w-md w-full mx-4 bg-white/5 border-white/10">
            <CardContent className="pt-8 text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Redirection vers Stripe</h2>
              <p className="text-white/60">
                Vous allez être redirigé vers le paiement sécurisé...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link 
            href={packSize ? "/pricing" : "/explore"} 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {packSize ? "Retour aux tarifs" : "Retour à l'explorateur"}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-primary">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-primary text-primary-foreground">
                    1
                  </div>
                  Détails
                </div>
                <div className="h-px flex-1 bg-white/10" />
                <div className="flex items-center gap-2 text-white/40">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/10">
                    2
                  </div>
                  Paiement Stripe
                </div>
              </div>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Personnalisez {packConfig.slots > 1 ? 'vos slots' : 'votre slot'}
                  </CardTitle>
                  <p className="text-white/60 text-sm">
                    {packConfig.slots > 1 
                      ? 'Ces informations seront appliquées à tous les slots. Vous pourrez les modifier individuellement plus tard depuis votre dashboard.'
                      : 'Créez votre présence sur la sphère digitale'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">Email pour la facture *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      required
                    />
                    <p className="text-xs text-white/40">La facture sera envoyée à cet email</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Titre *</Label>
                    <Input
                      id="title"
                      placeholder="Votre marque ou projet"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      maxLength={50}
                    />
                    <p className="text-xs text-white/40">{formData.title.length}/50 caractères</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Input
                      id="description"
                      placeholder="Description courte (optionnel)"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      maxLength={200}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-white">URL de destination</Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://votresite.com"
                      value={formData.targetUrl}
                      onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                    <p className="text-xs text-white/40">Le lien vers lequel les visiteurs seront redirigés</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">Catégorie</Label>
                    <select
                      id="category"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-white"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <option value="technology">💻 Technology</option>
                      <option value="business">💼 Business</option>
                      <option value="creative">🎨 Creative</option>
                      <option value="gaming">🎮 Gaming</option>
                      <option value="education">📚 Education</option>
                      <option value="health">🏃 Health & Wellness</option>
                      <option value="finance">💰 Finance</option>
                      <option value="travel">✈️ Travel</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>

                  {packConfig.slots > 1 && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-white/80">
                        💡 <strong>Conseil:</strong> Après l'achat, vous pourrez personnaliser chaque slot individuellement depuis votre dashboard.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="ml-auto" 
                    onClick={handlePayment}
                    disabled={isLoading || !formData.email || !formData.title}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirection...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Payer €{price} via Stripe
                      </>
                    )}
                  </Button>
                  <p className="ml-auto mt-2 text-xs text-white/40 flex items-center gap-1">
                    <LogIn className="w-3 h-3" />
                    Compte connecté requis pour finaliser l'achat
                  </p>
                </CardFooter>
              </Card>

              {/* Security info */}
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-white text-sm font-medium">Paiement sécurisé par Stripe</p>
                    <p className="text-white/40 text-xs">Vos données bancaires sont chiffrées et ne transitent jamais par nos serveurs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white/5 border-white/10 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pack info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{packConfig.name}</p>
                      <p className="text-white/40 text-sm">{packConfig.slots} slot{packConfig.slots > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Slot number (if single) */}
                  {packConfig.slots === 1 && slotNumber > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Numéro de slot</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        #{formatNumber(slotNumber)}
                      </Badge>
                    </div>
                  )}

                  {/* Preview */}
                  {formData.title && (
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-white font-medium truncate">{formData.title}</p>
                      {formData.description && (
                        <p className="text-white/40 text-sm truncate">{formData.description}</p>
                      )}
                    </div>
                  )}

                  <Separator className="bg-white/10" />

                  {/* Pricing */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Prix unitaire</span>
                      <span className="text-white">€{BASE_SLOT_PRICE_EUR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Quantité</span>
                      <span className="text-white">{packConfig.slots}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Sous-total</span>
                      <span className="text-white">€{originalPrice}</span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Réduction ({packConfig.discount}%)</span>
                        <span>-€{savings}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-white/10" />

                  {/* Total */}
                  <div className="flex justify-between text-lg font-semibold">
                    <span className="text-white">Total</span>
                    <span className="text-primary">€{price}</span>
                  </div>

                  <p className="text-xs text-white/40 text-center">
                    Paiement unique • Propriété à vie
                  </p>

                  {/* Badge earned */}
                  {packConfig.slots >= 10 && badgeInfo && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                      <p className="text-amber-400 text-sm font-medium">
                        {badgeInfo.icon} Badge "{badgeInfo.name}" débloqué!
                      </p>
                    </div>
                  )}
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

// Export with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  )
}
