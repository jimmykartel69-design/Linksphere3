/**
 * LinkSphere - Homepage
 * Main landing page with hero, features, categories, and CTA
 */

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { 
  HeroSection, 
  StatsCounter, 
  FeaturesSection, 
  CategoriesSection, 
  CTASection, 
  FAQSection 
} from '@/components/home'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { TOTAL_SLOTS } from '@/lib/constants'

async function getHomeStats() {
  try {
    const supabase = await getSupabaseServerClient()
    const [soldRes, reservedRes, disabledRes] = await Promise.all([
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'SOLD'),
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'RESERVED'),
      supabase.from('slots').select('id', { head: true, count: 'exact' }).eq('status', 'DISABLED'),
    ])

    const soldSlots = soldRes.count || 0
    const reservedSlots = reservedRes.count || 0
    const disabledSlots = disabledRes.count || 0
    const lockedSlots = reservedSlots + disabledSlots

    return {
      totalSlots: TOTAL_SLOTS,
      soldSlots,
      reservedSlots: lockedSlots,
      disabledSlots,
      availableSlots: Math.max(0, TOTAL_SLOTS - soldSlots - lockedSlots),
    }
  } catch {
    return {
      totalSlots: TOTAL_SLOTS,
      soldSlots: 0,
      reservedSlots: 0,
      disabledSlots: 0,
      availableSlots: TOTAL_SLOTS,
    }
  }
}

export default async function HomePage() {
  const stats = await getHomeStats()

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <Header transparent />

      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Stats Counter */}
      <StatsCounter initialStats={stats} />

      {/* Features */}
      <FeaturesSection />

      {/* Categories */}
      <CategoriesSection />

      {/* CTA */}
      <CTASection />

      {/* FAQ */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </main>
  )
}
