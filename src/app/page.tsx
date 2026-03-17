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

export default function HomePage() {
  // Initial stats (in production, these would be fetched from the database)
  const stats = {
    totalSlots: 1_000_000,
    availableSlots: 999_850,
    soldSlots: 150,
    reservedSlots: 12,
  }

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
