/**
 * API response type definitions
 */
import type { Category } from './slot'

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

/**
 * API error structure
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

/**
 * API metadata (pagination, etc.)
 */
export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasMore?: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[]
  meta: Required<ApiMeta>
}

/**
 * API query parameters
 */
export interface ApiQueryParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

/**
 * Slot list API response
 */
export interface SlotListResponse {
  items: Array<{
    id: string
    slotNumber: number
    status: string
    title: string | null
    description: string | null
    logoUrl: string | null
    category: { name: string; slug: string } | null
  }>
  meta: Required<ApiMeta>
}

/**
 * Global stats API response
 */
export interface GlobalStatsResponse {
  totalSlots: number
  availableSlots: number
  soldSlots: number
  reservedSlots: number
  totalRevenue: number
  recentSales: number
  activeUsers: number
}

/**
 * Category list API response
 */
export interface CategoryListResponse {
  categories: Category[]
}

/**
 * Purchase flow responses
 */
export interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

export interface PurchaseConfirmationResponse {
  success: boolean
  slotId: string
  slotNumber: number
  purchaseId: string
}

/**
 * Analytics API responses
 */
export interface SlotAnalyticsResponse {
  slotId: string
  views: AnalyticsDataPoint[]
  clicks: AnalyticsDataPoint[]
  totalViews: number
  totalClicks: number
  avgDailyViews: number
  avgDailyClicks: number
  topCountries: CountryMetric[]
}

export interface AnalyticsDataPoint {
  date: string
  value: number
}

export interface CountryMetric {
  country: string
  count: number
  percentage: number
}

/**
 * Search API response
 */
export interface SearchResponse<T> {
  results: T[]
  query: string
  total: number
  took: number // milliseconds
}
