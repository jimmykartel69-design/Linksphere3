/**
 * LinkSphere - Stats Counter Section
 * Live statistics display
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import { TOTAL_SLOTS } from '@/lib/constants'
import { useTranslation } from '@/i18n/provider'

// Format number with consistent locale (en-US) to avoid hydration mismatch
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

interface StatsCounterProps {
  initialStats?: {
    availableSlots: number
    soldSlots: number
    reservedSlots: number
  }
}

export function StatsCounter({ initialStats }: StatsCounterProps) {
  const { t } = useTranslation()
  const stats = initialStats || {
    availableSlots: TOTAL_SLOTS,
    soldSlots: 0,
    reservedSlots: 0,
  }

  // Use ref to track if component is mounted (for client-side animation)
  const isMounted = useRef(false)
  const [displayStats, setDisplayStats] = useState({
    available: stats.availableSlots,
    sold: stats.soldSlots,
    reserved: stats.reservedSlots,
  })

  useEffect(() => {
    isMounted.current = true
    
    // Start animation from 0 only on client
    setDisplayStats({
      available: 0,
      sold: 0,
      reserved: 0,
    })
    
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
      
      setDisplayStats({
        available: Math.round(stats.availableSlots * eased),
        sold: Math.round(stats.soldSlots * eased),
        reserved: Math.round(stats.reservedSlots * eased),
      })
      
      if (step >= steps) {
        clearInterval(timer)
      }
    }, interval)
    
    return () => clearInterval(timer)
  }, [stats.availableSlots, stats.soldSlots, stats.reservedSlots])

  return (
    <section className="py-16 bg-black border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-white mb-2">
              {formatNumber(TOTAL_SLOTS)}
            </div>
            <div className="text-white/50 text-sm">{t('home.counters.slots')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-green-400 mb-2">
              {formatNumber(displayStats.available)}
            </div>
            <div className="text-white/50 text-sm">{t('home.counters.available')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">
              {formatNumber(displayStats.sold)}
            </div>
            <div className="text-white/50 text-sm">{t('home.counters.sold')}</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-amber-400 mb-2">
              {formatNumber(displayStats.reserved)}
            </div>
            <div className="text-white/50 text-sm">{t('home.counters.reserved')}</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsCounter
