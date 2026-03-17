/**
 * LinkSphere - Hero Section
 * Main hero section for homepage
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { SITE_NAME, SITE_TAGLINE, TOTAL_SLOTS } from '@/lib/constants'

// Format number with consistent locale (en-US) to avoid hydration mismatch
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

interface HeroSectionProps {
  stats?: {
    totalSlots: number
    availableSlots: number
    soldSlots: number
  }
}

export function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
      
      {/* Animated particles/grid */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat" />
      </div>
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-white/70">1,000,000 slots available</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Own Your Place in the
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-transparent">
              Digital Universe
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-white/60 mb-8">
            {SITE_TAGLINE}. Join thousands of brands and creators who have secured 
            their permanent spot on the world&apos;s most innovative digital visibility platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2 px-8" asChild>
              <Link href="/explore">
                Explore the Sphere
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 px-8 border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/#how-it-works">
                <Play className="w-4 h-4" />
                How It Works
              </Link>
            </Button>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {formatNumber(stats.totalSlots)}
                </div>
                <div className="text-sm text-white/50">Total Slots</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-green-400 mb-1">
                  {formatNumber(stats.availableSlots)}
                </div>
                <div className="text-sm text-white/50">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">
                  {formatNumber(stats.soldSlots)}
                </div>
                <div className="text-sm text-white/50">Claimed</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
