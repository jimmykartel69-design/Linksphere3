/**
 * LinkSphere - User Dashboard
 * Manage slots and view purchase history
 */

'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Globe, 
  Plus, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  BarChart3,
  Package,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  CreditCard,
} from 'lucide-react'
import { TOTAL_SLOTS, BASE_SLOT_PRICE_EUR, USER_BADGES } from '@/lib/constants'
import { useTranslation } from '@/i18n/provider'

// Format number
function formatNumber(num: number, locale = 'en'): string {
  return num.toLocaleString(locale)
}

// Format date
function formatDate(date: Date | string, locale = 'en'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// For useSyncExternalStore
const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

// Mock purchase history (will be replaced with real data from API)
interface Purchase {
  id: string
  packName: string
  packSize: number
  amount: number
  currency: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  createdAt: string
  stripePaymentId?: string
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [user, setUser] = useState<{
    id: string
    email: string
    name: string | null
    locale?: string
    badge: string
    slotCount: number
    badgeInfo?: {
      name: string
      icon: string
      color: string
    }
  } | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({ views: 0, clicks: 0 })

  // Fetch user data
  useEffect(() => {
    if (!mounted) return

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (e) {
        console.error('Failed to fetch user:', e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [mounted])

  // Fetch purchases and owned slots
  useEffect(() => {
    if (!mounted) return

    const fetchDashboardData = async () => {
      try {
        const [purchasesRes, slotsRes] = await Promise.all([
          fetch('/api/purchases'),
          fetch('/api/slots/mine'),
        ])

        if (purchasesRes.ok) {
          const purchaseData = await purchasesRes.json()
          setPurchases(
            (purchaseData.purchases || []).map((p: any) => ({
              id: p.id,
              packName: p.pack_name || `Pack ${p.pack_size || 1} Slots`,
              packSize: p.pack_size || 1,
              amount: p.amount || 0,
              currency: p.currency || 'EUR',
              status: p.status,
              createdAt: p.created_at || p.createdAt,
              stripePaymentId: p.stripe_payment_id || p.stripePaymentId,
            }))
          )
        }

        if (slotsRes.ok) {
          const slotData = await slotsRes.json()
          const slots = slotData.slots || []
          const views = slots.reduce((sum: number, slot: any) => sum + (slot.view_count || 0), 0)
          const clicks = slots.reduce((sum: number, slot: any) => sum + (slot.click_count || 0), 0)
          setMetrics({ views, clicks })
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      }
    }

    fetchDashboardData()
  }, [mounted])

  // Get badge info
  const getBadgeDisplay = (badge: string) => {
    const badgeInfo = USER_BADGES[badge as keyof typeof USER_BADGES]
    if (!badgeInfo || badge === 'NONE') return null
    return badgeInfo
  }

  const badgeDisplay = user ? getBadgeDisplay(user.badge) : null
  const locale = user?.locale || 'en'
  const totalViews = metrics.views
  const totalClicks = metrics.clicks

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col bg-black">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <div className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-white">
                  {mounted && user ? `${t('dashboard.welcome').replace('{name}', user.name || user.email.split('@')[0])}` : t('nav.dashboard')}
                </h1>
                {badgeDisplay && (
                  <Badge 
                    className="px-2 py-1"
                    style={{ 
                      backgroundColor: `${badgeDisplay.color}20`,
                      color: badgeDisplay.color 
                    }}
                  >
                    {badgeDisplay.icon} {badgeDisplay.name}
                  </Badge>
                )}
              </div>
              <p className="text-white/60">{t('dashboard.analytics.title')}</p>
            </div>
            <Button asChild>
              <Link href="/explore">
                <Plus className="w-4 h-4 mr-2" />
                {t('home.cta.button')}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{user?.slotCount || 0}</p>
                    <p className="text-white/40 text-sm">{t('dashboard.stats.slots')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{formatNumber(totalViews, locale)}</p>
                    <p className="text-white/40 text-sm">{t('dashboard.stats.views')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <MousePointer className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{formatNumber(totalClicks, locale)}</p>
                    <p className="text-white/40 text-sm">{t('dashboard.stats.clicks')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%</p>
                    <p className="text-white/40 text-sm">{t('dashboard.stats.ctr')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="slots" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger value="slots" className="data-[state=active]:bg-white/10">
                <Globe className="w-4 h-4 mr-2" />
                {t('dashboard.slots.title')}
              </TabsTrigger>
              <TabsTrigger value="purchases" className="data-[state=active]:bg-white/10">
                <Receipt className="w-4 h-4 mr-2" />
                {t('checkout.title')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">
                {t('nav.settings')}
              </TabsTrigger>
            </TabsList>

            {/* My Slots Tab */}
            <TabsContent value="slots" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="py-12 text-center">
                  <Globe className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{t('dashboard.slots.empty')}</h3>
                  <p className="text-white/40 mb-6 max-w-md mx-auto">
                    {t('home.cta.subtitle')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild size="lg">
                      <Link href="/pricing">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('nav.pricing')}
                      </Link>
                    </Button>
                  </div>
                  <p className="text-white/30 text-sm mt-4">
                    {formatNumber(TOTAL_SLOTS, locale)} {t('home.counters.slots').toLowerCase()} • €{BASE_SLOT_PRICE_EUR}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    {t('checkout.summary')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchases.length === 0 ? (
                    <div className="py-12 text-center">
                      <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">{t('explore.results.empty')}</h3>
                      <p className="text-white/40 mb-6">
                        {t('dashboard.analytics.title')}
                      </p>
                      <Button asChild>
                        <Link href="/pricing">
                          <CreditCard className="w-4 h-4 mr-2" />
                          {t('home.cta.button')}
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div 
                          key={purchase.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{purchase.packName}</p>
                              <p className="text-white/40 text-sm">{formatDate(purchase.createdAt, locale)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">€{purchase.amount}</p>
                            <Badge className={
                              purchase.status === 'COMPLETED' 
                                ? 'bg-green-500/20 text-green-400' 
                                : purchase.status === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }>
                              {purchase.status === 'COMPLETED' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {purchase.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                              {purchase.status === 'FAILED' && <XCircle className="w-3 h-3 mr-1" />}
                              {purchase.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stripe info */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-400 font-medium">{t('checkout.secure')}</p>
                    <p className="text-blue-400/70 text-sm">
                      {t('dashboard.purchases.invoiceNote')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">{t('dashboard.settings.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Email</Label>
                    <Input
                      value={user?.email || '—'}
                      disabled
                      className="bg-white/5 border-white/10 text-white/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">{t('dashboard.settings.name')}</Label>
                    <Input
                      value={user?.name || '—'}
                      disabled
                      className="bg-white/5 border-white/10 text-white/60"
                    />
                  </div>
                  <Separator className="bg-white/10" />
                  
                  {/* Badge info */}
                  {badgeDisplay && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <Label className="text-white mb-2 block">{t('nav.profile')}</Label>
                      <div className="flex items-center gap-3">
                        <Badge 
                          className="text-base px-3 py-1"
                          style={{ 
                            backgroundColor: `${badgeDisplay.color}20`,
                            color: badgeDisplay.color 
                          }}
                        >
                          {badgeDisplay.icon} {badgeDisplay.name}
                        </Badge>
                        <span className="text-white/40 text-sm">
                          ({user?.slotCount || 0} {t('home.counters.slots').toLowerCase()})
                        </span>
                      </div>
                      <p className="text-white/40 text-sm mt-2">
                        {t('home.cta.subtitle')}
                      </p>
                    </div>
                  )}

                  <Separator className="bg-white/10" />
                  
                  <Button variant="outline" className="border-white/10 text-white">
                    {t('button.edit')}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </main>
  )
}
