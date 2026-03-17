/**
 * Analytics type definitions
 */

export type AnalyticsEventType = 'VIEW' | 'CLICK' | 'HOVER'

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  id: string
  slotId: string
  eventType: AnalyticsEventType
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  country: string | null
  createdAt: Date
}

/**
 * Analytics event creation payload
 */
export interface AnalyticsEventPayload {
  slotId: string
  eventType: AnalyticsEventType
  metadata?: Record<string, unknown>
}

/**
 * Aggregated analytics data
 */
export interface AggregatedAnalytics {
  period: 'day' | 'week' | 'month' | 'year'
  startDate: Date
  endDate: Date
  views: number
  clicks: number
  avgViewsPerDay: number
  avgClicksPerDay: number
  clickThroughRate: number
  topReferrers: ReferrerData[]
  topCountries: CountryAnalytics[]
  deviceBreakdown: DeviceBreakdown
}

/**
 * Referrer data
 */
export interface ReferrerData {
  source: string
  count: number
  percentage: number
}

/**
 * Country analytics data
 */
export interface CountryAnalytics {
  countryCode: string
  countryName: string
  views: number
  clicks: number
  percentage: number
}

/**
 * Device breakdown
 */
export interface DeviceBreakdown {
  desktop: number
  mobile: number
  tablet: number
  other: number
}

/**
 * Dashboard analytics summary
 */
export interface DashboardAnalytics {
  totalViews: number
  totalClicks: number
  viewsChange: number // Percentage change from previous period
  clicksChange: number
  topSlots: TopSlotAnalytics[]
  recentActivity: RecentActivity[]
}

/**
 * Top performing slot analytics
 */
export interface TopSlotAnalytics {
  slotNumber: number
  title: string | null
  views: number
  clicks: number
  ctr: number
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string
  type: 'view' | 'click'
  slotNumber: number
  country: string | null
  timestamp: Date
}

/**
 * Analytics chart data
 */
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
}
