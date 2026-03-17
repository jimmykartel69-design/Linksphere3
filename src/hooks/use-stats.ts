/**
 * useStats Hook
 * Fetch and cache global statistics
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { STATS_CACHE_TTL } from '@/lib/constants'

interface GlobalStats {
  totalSlots: number
  availableSlots: number
  soldSlots: number
  reservedSlots: number
  totalRevenue: number
}

interface UseStatsReturn {
  stats: GlobalStats | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const CACHE_KEY = 'linksphere_stats'
const CACHE_TTL = STATS_CACHE_TTL * 1000 // Convert to ms

function getCachedStats(): GlobalStats | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

function setCachedStats(stats: GlobalStats): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: stats,
      timestamp: Date.now(),
    }))
  } catch {
    // Ignore storage errors
  }
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<GlobalStats | null>(() => getCachedStats())
  const [loading, setLoading] = useState(!stats)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }

      setStats(data)
      setCachedStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!stats) {
      fetchStats()
    }
  }, [stats, fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}
