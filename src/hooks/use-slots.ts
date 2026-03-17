/**
 * useSlots Hook
 * Fetch and manage slots with caching and pagination
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Slot, SlotFilters } from '@/types'

interface UseSlotsOptions {
  initialData?: Slot[]
  filters?: SlotFilters
  page?: number
  limit?: number
  autoFetch?: boolean
}

interface UseSlotsReturn {
  slots: Slot[]
  loading: boolean
  error: string | null
  meta: {
    page: number
    totalPages: number
    total: number
    hasMore: boolean
  }
  fetchSlots: (newPage?: number) => Promise<void>
  refresh: () => Promise<void>
  loadMore: () => Promise<void>
}

export function useSlots(options: UseSlotsOptions = {}): UseSlotsReturn {
  const {
    initialData = [],
    filters = {},
    page: initialPage = 1,
    limit = 20,
    autoFetch = true,
  } = options

  const [slots, setSlots] = useState<Slot[]>(initialData)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({
    page: initialPage,
    totalPages: 0,
    total: 0,
    hasMore: false,
  })

  const fetchSlots = useCallback(async (newPage?: number) => {
    const page = newPage ?? meta.page
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', String(limit))

      if (filters.status) {
        filters.status.forEach(s => params.append('status', s))
      }
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.countryId) params.set('countryId', filters.countryId)
      if (filters.languageId) params.set('languageId', filters.languageId)
      if (filters.search) params.set('search', filters.search)
      if (filters.minSlotNumber) params.set('minSlot', String(filters.minSlotNumber))
      if (filters.maxSlotNumber) params.set('maxSlot', String(filters.maxSlotNumber))

      const response = await fetch(`/api/slots?${params}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch slots')
      }

      setSlots(data.slots)
      setMeta(data.meta)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters, limit, meta.page])

  const refresh = useCallback(async () => {
    await fetchSlots(1)
  }, [fetchSlots])

  const loadMore = useCallback(async () => {
    if (meta.hasMore && !loading) {
      await fetchSlots(meta.page + 1)
    }
  }, [fetchSlots, meta.hasMore, meta.page, loading])

  useEffect(() => {
    if (autoFetch) {
      fetchSlots()
    }
  }, [])

  return {
    slots,
    loading,
    error,
    meta,
    fetchSlots,
    refresh,
    loadMore,
  }
}
